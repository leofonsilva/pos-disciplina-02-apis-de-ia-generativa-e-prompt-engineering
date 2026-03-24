import { faker } from "@faker-js/faker";
import { Neo4jService } from "../src/services/neo4jService.ts";
import courses from "./courses.json" with { type: "json" };

// Gera dados de teste aleatórios usando Faker
function generateTestData() {
  // Cria 20 estudantes com dados fictícios
  const students = Array.from({ length: 20 }, () => ({
    id: faker.string.uuid(),
    name: faker.person.fullName(),
    email: faker.internet.email(),
    phone: faker.phone.number(),
  }));

  // Cria registros de vendas (cada estudante comprou 1 a 10 cursos)
  const salesRecords = students.flatMap(student => {
    return Array.from({ length: faker.number.int({ min: 1, max: 10 }) }, () => ({
      studentId: student.id,
      courseId: faker.helpers.arrayElement(courses).name,  // Curso aleatório da lista
      status: faker.helpers.arrayElement(["paid", "refunded"]),  // Pago ou reembolsado
      paymentMethod: faker.helpers.arrayElement(["pix", "credit_card"]),  // Método de pagamento
      paymentDate: faker.date.past().toISOString(),
      amount: faker.number.float({ min: 0, max: 2000, fractionDigits: 2 }),  // Valor entre 0 e 2000
    }));
  });

  // Cria registros de progresso apenas para compras pagas
  const progressRecords = salesRecords
    .filter(sale => sale.status === "paid")  // Apenas cursos pagos têm progresso
    .map(sale => ({
      studentId: sale.studentId,
      courseId: sale.courseId,
      progress: faker.number.int({ min: 0, max: 100 }),  // Progresso de 0 a 100%
    }));

  return { students, salesRecords, progressRecords };
}

// Popula o banco Neo4j com dados de teste
export async function seedDatabase() {
  const neo4jService = new Neo4jService();

  console.log("🧹 Clearing database...");
  await neo4jService.clearDatabase();
  console.log("Database cleared!");

  // Gera os dados de teste
  const { students, salesRecords, progressRecords } = generateTestData();

  // Insere cursos usando Cypher (UNWIND para processar lotes)
  await neo4jService.query(
    `UNWIND $batch AS row
        MERGE (c:Course {name: row.name})
        ON CREATE SET c.url = row.url`,
    { batch: courses }
  );
  console.log("Courses Inserted!");

  // Insere estudantes
  await neo4jService.query(
    `UNWIND $batch AS row
        MERGE (s:Student {id: row.id})
        ON CREATE SET s.name = row.name, s.email = row.email, s.phone = row.phone`,
    { batch: students }
  );
  console.log("Students Inserted!");

  // Insere relações de compra (PURCHASED)
  await neo4jService.query(
    `UNWIND $batch AS row
        MATCH (s:Student {id: row.studentId}), (c:Course {name: row.courseId})
        MERGE (s)-[p:PURCHASED]->(c)
        ON CREATE SET p.status = row.status, p.paymentMethod = row.paymentMethod, p.paymentDate = row.paymentDate, p.amount = row.amount
        ON MATCH SET p.status = row.status, p.paymentMethod = row.paymentMethod, p.paymentDate = row.paymentDate, p.amount = row.amount`,
    { batch: salesRecords }
  );
  console.log("Sales Inserted!");

  // Insere relações de progresso (PROGRESS) apenas para cursos pagos
  await neo4jService.query(
    `UNWIND $batch AS row
        MATCH (s:Student {id: row.studentId})-[:PURCHASED {status: "paid"}]->(c:Course {name: row.courseId})
        MERGE (s)-[p:PROGRESS]->(c)
        ON CREATE SET p.progress = row.progress
        ON MATCH SET p.progress = row.progress`,
    { batch: progressRecords }
  );
  console.log("Progress Inserted!");

  // Fecha a conexão para evitar conflitos de transação
  await neo4jService.close();
}
