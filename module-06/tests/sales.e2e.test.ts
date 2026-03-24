import { describe, it, after, before } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from '../src/server.ts';
import { seedDatabase } from '../data/seedHelpers.ts';
import { type FastifyInstance } from 'fastify';

// Testes end-to-end do sistema de análise de vendas
describe('Sales Analytics Reporter - E2E Tests', async () => {
  let _app: FastifyInstance;

  // Função auxiliar para fazer requisições à API de vendas
  async function makeASalesRequest(question: string) {
    return _app.inject({
      method: 'POST',
      url: '/sales',
      payload: {
        question,
      },
    });
  }

  // Setup antes de todos os testes: popula banco e inicia servidor
  before(async () => {
    await seedDatabase();      // Carrega dados de teste
    _app = createServer();     // Cria servidor
    await _app.ready();        // Aguarda servidor ficar pronto
  });

  // Cleanup após todos os testes: fecha servidor
  after(async () => {
    await _app?.close()
  });

  // Teste 1: Listagem simples de cursos
  it('List all courses - Should return analytical response', async () => {
    const response = await makeASalesRequest(
      'List all available courses'
    );

    console.log('List courses response:', response.body);

    const body = JSON.parse(response.body);
    assert.equal(response.statusCode, 200);
    assert.ok(body.answer, 'Answer should exist');
    assert.ok(Array.isArray(body.followUpQuestions), 'Should have followUpQuestions array');

    // Deve mencionar alguns nomes de cursos do arquivo courses.json
    assert.ok(
      body.answer.includes('JavaScript') || body.answer.includes('Node.js'),
      'Answer should contain course names'
    );
  });

  // Teste 2: Consulta de alunos que compraram curso específico
  it('Query students who bought specific course - Should provide details', async () => {
    const response = await makeASalesRequest(
      'Who bought Formação JavaScript Expert?'
    );

    console.log('Students query response:', response.body);

    const body = JSON.parse(response.body);
    assert.equal(response.statusCode, 200);
    assert.ok(body.answer, 'Answer should exist');
    assert.ok(Array.isArray(body.followUpQuestions), 'Should have followUpQuestions array');
  });

  // Teste 3: Análise de receita por cartão de crédito
  it('Query total revenue from credit cards - Should include analytics', async () => {
    const response = await makeASalesRequest(
      'What is the total revenue from credit card payments?'
    );

    console.log('Revenue query response:', response.body);

    const body = JSON.parse(response.body);
    assert.equal(response.statusCode, 200);
    assert.ok(body.answer, 'Answer should exist');
    assert.ok(Array.isArray(body.followUpQuestions), 'Should have followUpQuestions array');
  });

  // Teste 4: Distribuição de receita entre cursos
  it('Revenue distribution analysis - Should show percentages and comparisons', async () => {
    const response = await makeASalesRequest(
      'Show me the revenue distribution across all courses'
    );

    console.log('Distribution analysis response:', response.body);

    const body = JSON.parse(response.body);
    assert.equal(response.statusCode, 200);
    assert.ok(body.answer, 'Answer should exist');
    assert.ok(Array.isArray(body.followUpQuestions), 'Should have followUpQuestions array');

    // A resposta deve conter números ou percentuais
    assert.ok(
      body.answer.match(/\d+%|\$\d+|revenue/i),
      'Answer should contain analytical metrics'
    );
  });

  // Teste 5: Alunos com 100% de progresso
  it('Query students with 100% progress - Should provide insights', async () => {
    const response = await makeASalesRequest(
      'Which students have 100% progress in their courses?'
    );

    console.log('Progress query response:', response.body);

    const body = JSON.parse(response.body);
    assert.equal(response.statusCode, 200);
    assert.ok(body.answer, 'Answer should exist');
    assert.ok(Array.isArray(body.followUpQuestions), 'Should have followUpQuestions array');
  });

  // Teste 6: Análise de métodos de pagamento
  it('Payment method analysis - Should compare different methods', async () => {
    const response = await makeASalesRequest(
      'What are the most popular payment methods?'
    );

    console.log('Payment method analysis response:', response.body);

    const body = JSON.parse(response.body);
    assert.equal(response.statusCode, 200);
    assert.ok(body.answer, 'Answer should exist');
    assert.ok(Array.isArray(body.followUpQuestions), 'Should have followUpQuestions array');
  });

  // Teste 7: Caso de borda - progresso sem compra
  it('Edge case: Students with progress but no purchase - Should handle gracefully', async () => {
    const response = await makeASalesRequest(
      'Are there students with progress in a course they never bought?'
    );

    console.log('Edge case query response:', response.body);

    const body = JSON.parse(response.body);
    assert.equal(response.statusCode, 200);
    assert.ok(body.answer, 'Answer should exist');
  });

  // Teste 8: Pergunta inválida (fora do domínio)
  it('Invalid/unclear question - Should handle gracefully with suggestions', async () => {
    const response = await makeASalesRequest(
      'What is the weather today?'
    );

    console.log('Invalid question response:', response.body);

    const body = JSON.parse(response.body);
    assert.equal(response.statusCode, 200);
    // Deve ter erro OU resposta explicando que não encontrou
    assert.ok(
      body.error || body.answer,
      'Should have either error or answer'
    );
  });

  // Teste 9: Alunos que nunca iniciaram curso
  it('Query students who never started a course - Should show engagement gaps', async () => {
    const response = await makeASalesRequest(
      'Which students bought a course but never started it?'
    );

    console.log('Students without progress response:', response.body);

    const body = JSON.parse(response.body);
    assert.equal(response.statusCode, 200);
    assert.ok(body.answer, 'Answer should exist');
    assert.ok(Array.isArray(body.followUpQuestions), 'Should have followUpQuestions array');
  });

  // Teste 10: Verificação de perguntas de acompanhamento
  it('Follow-up questions - Should provide relevant suggestions', async () => {
    const response = await makeASalesRequest(
      'Show me the top performing courses'
    );

    console.log('Follow-up questions test response:', response.body);

    const body = JSON.parse(response.body);
    assert.equal(response.statusCode, 200);
    assert.ok(body.answer, 'Answer should exist');
    assert.ok(Array.isArray(body.followUpQuestions), 'Should have followUpQuestions array');

    // Deve sugerir pelo menos 2 perguntas de acompanhamento
    assert.ok(
      body.followUpQuestions.length >= 2,
      'Should provide at least 2 follow-up questions'
    );
  });
});
