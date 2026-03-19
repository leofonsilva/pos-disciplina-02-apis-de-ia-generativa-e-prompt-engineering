import { getSystemPrompt, getUserPromptTemplate, IntentSchema } from '../../prompts/v1/identifyIntent.ts';
import { professionals } from '../../services/appointmentService.ts';
import { OpenRouterService } from '../../services/openRouterService.ts';
import type { GraphState } from '../graph.ts';

// Factory que cria um nó para identificar a intenção do usuário usando IA
export function createIdentifyIntentNode(llmClient: OpenRouterService) {
  return async (state: GraphState): Promise<Partial<GraphState>> => {
    console.log(`Identifying intent...`);
    
    // Pega a última mensagem do usuário no histórico
    const input = state.messages.at(-1)!.text;

    try {
      // Prepara os prompts para enviar ao modelo de IA
      const systemPrompt = getSystemPrompt(professionals)  // Contexto com lista de profissionais
      const userPrompt = getUserPromptTemplate(input)       // Pergunta do usuário formatada
      
      // Chama a IA para identificar a intenção de forma estruturada
      const result = await llmClient.generateStructured(
        systemPrompt,
        userPrompt,
        IntentSchema,  // Schema que define o formato esperado (ex: { intent, professional, date })
      )
      
      // Se a IA não conseguir identificar, retorna erro
      if (!result.success) {
        console.log(`Intent identification failed: ${result.error}`);
        return {
          intent: 'unknown',
          error: result.error
        }
      }

      // Extrai os dados estruturados da resposta da IA
      const intentData = result.data!
      console.log(`Intent identified: ${intentData.intent}`);

      // Retorna os dados identificados (intenção, profissional, data, etc.)
      return {
        ...intentData,
      };

    } catch (error) {
      // Captura qualquer erro durante o processo
      console.error('Error in identifyIntent node:', error);
      return {
        ...state,
        intent: 'unknown',
        error: error instanceof Error ? error.message : 'Intent identification failed',
      };
    }
  };
}
