import { buildDocumentQAGraphInstance } from './graph/factory.ts';
import Fastify from 'fastify';
import { HumanMessage } from '@langchain/core/messages';
import multipart from '@fastify/multipart';

// Cria e configura o servidor Fastify com suporte a upload de arquivos
export const createServer = () => {
  const app = Fastify({
    logger: false
  });

  // Registra plugin para processar uploads multipart (formulários com arquivos)
  app.register(multipart, {
    limits: {
      fileSize: 10 * 1024 * 1024, // Limite de 10MB para arquivos
    },
  });

  // Constrói o grafo de QA de documentos
  const { graph } = buildDocumentQAGraphInstance();

  // Rota POST para upload de PDF e pergunta
  app.post('/chat', async function (request, reply) {
    try {
      // Extrai o arquivo enviado no formulário
      const data = await request.file();

      // Validações
      if (!data) {
        return reply.status(400).send({ error: 'No file uploaded' });
      }

      if (data.mimetype !== 'application/pdf') {
        return reply.status(400).send({ error: 'Only PDF files are supported' });
      }

      // Extrai a pergunta do campo do formulário
      const questionField = data.fields.question;
      const question = questionField && 'value' in questionField ? questionField.value : undefined;

      if (!question || typeof question !== 'string' || question.trim().length < 3) {
        return reply.status(400).send({
          error: 'Question is required and must be at least 3 characters'
        });
      }

      // Converte o arquivo para base64 (formato aceito por modelos multimodais)
      const buffer = await data.toBuffer();
      const documentBase64 = buffer.toString('base64');

      // Invoca o grafo com a pergunta e o documento codificado
      const response = await graph.invoke({
        messages: [new HumanMessage(question)],
        documentBase64,  // PDF em base64 para o modelo multimodal
      });

      // Retorna a resposta do modelo
      return {
        filename: data.filename,
        question,
        answer: response.messages.at(-1)?.text || 'No answer generated',
        error: response.error,
      };
    } catch (error) {
      console.error('Error analyzing document:', error);
      return reply.status(500).send({
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  return app;
};
