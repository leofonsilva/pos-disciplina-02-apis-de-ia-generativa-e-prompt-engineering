import { seedDatabase } from "./seedHelpers.ts";

// Função que executa o seeding do banco de dados
async function insertData() {
  await seedDatabase();  // Popula o banco com dados iniciais
}

// Executa o seeding ao iniciar o script
await insertData();
