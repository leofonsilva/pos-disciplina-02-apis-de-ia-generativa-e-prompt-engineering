import { AIMessage } from 'langchain';
import type { OpenRouterService } from '../../services/openrouterService.ts';
import type { GraphState } from '../graph.ts';

// Factory que cria um nó para gerar respostas usando modelo multimodal (imagem + texto)
export function createAnswerGenerationNode(
  llmClient: OpenRouterService
) {
  return async (state: GraphState): Promise<Partial<GraphState>> => {
    try {
      // Verifica se há um documento (imagem/PDF) para analisar
      if (!state.documentBase64) {
        return {
          messages: [new AIMessage('No document found in state')]
        }
      }

      console.log('Sending document to multimodal model for analysis...');

      // Prompt de sistema: define o papel do assistente
      const systemPrompt = 'You are a helpful AI assistant that can analyze documents and answer questions about them.'

      // Última mensagem do usuário (pergunta sobre o documento)
      const userPrompt = state.messages.at(-1)?.text;

      // Chama o modelo multimodal com o documento em base64
      const response = await llmClient.generateWithDocument(
        systemPrompt,
        userPrompt!,
        state.documentBase64!,  // Documento codificado (ex: imagem, PDF)
      );

      console.log(`Model: ${response.model}`);

      // Retorna a resposta gerada como mensagem da IA
      return {
        messages: [new AIMessage(response.content)]
      };

    } catch (error) {
      console.error('Error in answerGenerationNode:', error);
      return {
        messages: [new AIMessage(`Failed to generate answer: ${error instanceof Error ? error.message : 'Unknown error'}`)]
      };
    }
  };
}
