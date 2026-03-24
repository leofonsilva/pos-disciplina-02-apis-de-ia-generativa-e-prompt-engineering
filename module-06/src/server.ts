import { buildSalesQAGraph } from './graph/factory.ts';
import Fastify from 'fastify';
import { HumanMessage } from '@langchain/core/messages';

// Cria e configura o servidor Fastify com rota para análise de vendas
export const createServer = () => {
  const app = Fastify({
    logger: false  // Desativa logs internos do Fastify
  });

  // Constrói o grafo de análise de vendas com as dependências
  const { graph, neo4jService } = buildSalesQAGraph();

  // Hook executado quando o servidor fecha: fecha conexão com Neo4j
  app.addHook('onClose', async () => {
    try {
      await neo4jService.close();
    } catch (error) {
      console.error('Error closing Neo4j connection:', error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

  // Rota POST para perguntas sobre dados de vendas
  app.post('/sales', {
    schema: {
      body: {
        type: 'object',
        required: ['question'],
        properties: {
          question: { type: 'string', minLength: 3 },  // Mínimo 3 caracteres
        },
      }
    }
  }, async function (request, reply) {
    try {
      const { question } = request.body as { question: string };

      // Logs informativos sobre a pergunta recebida
      console.log('\n' + '═'.repeat(60));
      console.log(`Sales Analytics: "${question}"`);
      console.log('═'.repeat(60));

      // Executa o grafo com a pergunta do usuário
      const startTime = Date.now();
      const response = await graph.invoke({
        messages: [new HumanMessage(question)]
      });
      const processingTimeMs = Date.now() - startTime;

      // Log do resultado da análise
      console.log('\n' + '═'.repeat(60));
      console.log(`Analysis completed in ${processingTimeMs}ms`);
      console.log(`Answer: ${response.answer?.substring(0, 100)}${(response?.answer?.length || 0) > 100 ? '...' : ''}`);
      console.log(`Follow-ups: ${response.followUpQuestions?.length || 0} suggested`);
      console.log('═'.repeat(60) + '\n');

      // Retorna a resposta estruturada para o cliente
      return {
        answer: response.answer || 'No answer generated',
        followUpQuestions: response.followUpQuestions || [],
        query: response.query,           // Query Cypher gerada (para debug)
        error: response.error,           // Erro se houver
      };
    } catch (error) {
      console.error('Error processing sales query', error);
      return reply.status(500).send({
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  return app;
};
