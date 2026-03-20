import { HumanMessage } from 'langchain';
import { type Runtime } from '@langchain/langgraph'
import { OpenRouterService } from '../../services/openrouterService.ts';
import type { GraphState } from '../graph.ts';
import { type ConversationSummary, getSummarizationSystemPrompt, getSummarizationUserPrompt, SummarySchema } from '../../prompts/v1/summarization.ts';
import { PreferencesService } from '../../services/preferencesService.ts';
import { RemoveMessage } from '@langchain/core/messages';

// Factory que cria um nó para resumir o histórico da conversa
export function createSummarizationNode(llmClient: OpenRouterService, preferencesService: PreferencesService) {
  return async (state: GraphState, runtime?: Runtime): Promise<Partial<GraphState>> => {
    // Converte o histórico de mensagens para um formato mais simples
    const conversationHistory = state.messages.map(msg => ({
      role: HumanMessage.isInstance(msg) ? 'User' : 'AI',  // Identifica quem falou
      content: msg.text                                     // Conteúdo da mensagem
    }))

    // Recupera o resumo anterior, se existir
    const previousSummary = state.conversationSummary as ConversationSummary | undefined

    // Prepara os prompts para a IA gerar o resumo
    const systemPrompt = getSummarizationSystemPrompt()
    const userPrompt = getSummarizationUserPrompt(
      conversationHistory,
      previousSummary,  // Inclui o resumo anterior para manter continuidade
    )

    // Chama a IA para gerar um resumo estruturado
    const result = await llmClient.generateStructured(
      systemPrompt,
      userPrompt,
      SummarySchema,  // Schema esperado: { keyPoints, topics, followUpQuestions }
    )

    // Se falhou, desativa a flag de sumarização e retorna
    if (result.error || !result.data) {
      console.error('Falha ao sumarizar conversa:', result.error);
      return {
        needsSummarization: false
      }
    }

    // Obtém o ID do usuário para armazenar o resumo
    const userId = String(runtime?.context?.userId || state.userId || 'unknown')

    // Salva o resumo no serviço de preferências
    await preferencesService.storeSummary(
      userId, result.data,
    )

    // Marca para remover todas as mensagens antigas, mantendo apenas as 2 mais recentes
    // slice(0, -2) pega todas exceto as 2 últimas (última pergunta e última resposta)
    const deleteMessages = state.messages
      .slice(0, -2)
      .map(m => new RemoveMessage({ id: m.id as string }))

    // Retorna o estado atualizado: mensagens a remover, novo resumo, flag desativada
    return {
      messages: deleteMessages,        // Mensagens que serão removidas do histórico
      conversationSummary: result.data, // Novo resumo acumulado
      needsSummarization: false,        // Resumo concluído
    };
  };
}
