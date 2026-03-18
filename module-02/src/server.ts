import Fastify from "fastify";
import { buildGraph } from "./graph/graph.ts";
import { HumanMessage } from "langchain";

// Constrói o grafo de processamento da IA (cadeia de operações)
const graph = buildGraph()

// Cria e configura um servidor Fastify com uma rota para chat
export const createServer = () => {
  const app = Fastify({ logger: false })

  // Rota POST que recebe perguntas e retorna respostas geradas pela IA
  app.post('/chat', {
    schema: {
      body: {
        type: 'object',
        required: ['question'],
        properties: {
          question: { type: 'string', minLength: 5 }
        }
      }
    }
  }, async (request, reply) => {
    try {
      // Extrai a pergunta enviada pelo usuário
      const { question } = request.body as { question: string }

      // Executa o grafo de IA com a pergunta convertida para mensagem humana
      const response = await graph.invoke({
        messages: [new HumanMessage(question)]
      })

      // Retorna a resposta gerada para o cliente
      return reply.send(response.output)
    } catch (error) {
      // Em caso de erro, registra no console e retorna status 500
      console.error('Error handling /chat request:', error)
      return reply.code(500)
    }
  })

  return app
}
