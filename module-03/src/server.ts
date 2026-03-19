import { HumanMessage } from 'langchain';
import { buildGraph } from './graph/factory.ts';

import Fastify from 'fastify';

// Constrói o grafo de IA uma única vez (reutilizado em todas as requisições)
const graph = buildGraph();

// Cria e configura um servidor Fastify com rota para chat
export const createServer = () => {
  const app = Fastify();

  // Rota POST que recebe perguntas e retorna respostas da IA
  app.post('/chat', {
    schema: {
      body: {
        type: 'object',
        required: ['question'],
        properties: {
          question: { type: 'string', minLength: 10 },  // Mínimo de 10 caracteres
        },
      }
    }
  }, async function (request, reply) {
    try {
      // Extrai a pergunta enviada pelo usuário
      const { question } = request.body as {
        question: string;
      };

      // Executa o grafo de IA com a pergunta convertida para mensagem humana
      const response = await graph.invoke({
        messages: [new HumanMessage(question)],
      });

      // Retorna a resposta completa do grafo
      return response

    } catch (error) {
      // Em caso de erro, retorna status 500 com mensagem genérica
      console.error('Error processing request:', error);
      return reply.status(500).send({
        error: 'An error occurred while processing your request.',
      });
    }
  });

  return app;
};
