import { getSystemPrompt, getUserPromptTemplate, MessageSchema } from '../../prompts/v1/messageGenerator.ts';
import { OpenRouterService } from '../../services/openRouterService.ts';
import type { GraphState } from '../graph.ts';
import { AIMessage } from 'langchain';

// Factory que cria um nó para gerar mensagens de resposta usando IA
export function createMessageGeneratorNode(llmClient: OpenRouterService) {
  return async (state: GraphState): Promise<Partial<GraphState>> => {
    console.log(`Generating response message...`);

    try {
      // Define o cenário baseado no sucesso ou falha da ação anterior
      const hasSucceeded = state.actionSuccess ? 'success' : 'error'
      const scenario = `${state.intent ?? 'unknown'}_${hasSucceeded}`
      
      // Coleta os detalhes relevantes para montar a mensagem
      const details = {
        professionalName: state.professionalName,
        datetime: state.datetime,
        patientName: state.patientName,
        error: state.error,
      }

      // Prepara os prompts para a IA gerar uma mensagem natural
      const systemPrompt = getSystemPrompt()
      const userPrompt = getUserPromptTemplate({ scenario, details })

      // Chama a IA para gerar uma mensagem estruturada baseada no cenário
      const result = await llmClient.generateStructured(
        systemPrompt,
        userPrompt,
        MessageSchema,  // Schema que define o formato da mensagem
      )
      
      console.log(`Message generated:`, result.data?.message ?? result.data ?? result);

      // Se houver erro na geração, retorna uma mensagem padrão de erro
      if (result.error) {
        console.log(`Message generation failed: ${result.error}`);
        return {
          messages: [
            ...state.messages,  // Mantém o histórico existente
            new AIMessage("Desculpe, errei!")  // Mensagem genérica de erro
          ],
        };
      }

      // Retorna a mensagem gerada pela IA adicionada ao histórico
      return {
        messages: [
          ...state.messages,  // Mantém o histórico existente
          new AIMessage(result.data!.message)  // Mensagem gerada pela IA
        ],
      };
      
    } catch (error) {
      // Captura qualquer erro inesperado durante o processo
      console.error('Error in messageGenerator node:', error);
      return {
        messages: [
          ...state.messages,
          new AIMessage('An error occurred while processing your request.')  // Mensagem de erro genérica
        ],
      };
    }
  };
}
