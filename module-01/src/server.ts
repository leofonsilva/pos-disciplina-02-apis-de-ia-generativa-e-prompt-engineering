import Fastify from "fastify";
import { OpenRouterService } from "./openrouterService.ts";

// Cria e configura um servidor Fastify com uma rota para chat
export const createServer = (routerService: OpenRouterService) => {
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
      
      // Envia a pergunta para o serviço OpenRouter e aguarda a resposta
      const response = await routerService.generate(question)
      
      // Retorna a resposta para o cliente
      return reply.send(response)
    } catch (error) {
      // Em caso de erro, registra e retorna status 500
      console.error('Error handling /chat request:', error)
      return reply.code(500)
    }
  })

  return app
}