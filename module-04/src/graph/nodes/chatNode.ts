import type { Runtime } from '@langchain/langgraph';
import { OpenRouterService } from '../../services/openrouterService.ts';
import type { GraphState } from '../graph.ts';
import { ChatResponseSchema, getSystemPrompt, getUserPromptTemplate } from '../../prompts/v1/chatResponse.ts';
import { AIMessage, HumanMessage } from 'langchain';
import { PreferencesService } from '../../services/preferencesService.ts';
import { config } from '../../config.ts';

// Factory que cria um nó para geração de respostas de chat com contexto do usuário
export function createChatNode(llmClient: OpenRouterService, preferencesService: PreferencesService) {
  return async (state: GraphState, runtime?: Runtime): Promise<Partial<GraphState>> => {
    // Obtém o ID do usuário (do contexto de execução ou do estado)
    const userId = String(runtime?.context?.userId || state.userId || 'unknown')

    // Carrega as preferências do usuário (nome, idioma, etc.)
    const userContext = state.userContext ?? await preferencesService.getBasicInfo(userId)

    // Prepara o prompt de sistema com o contexto do usuário
    const systemPrompt = getSystemPrompt(userContext)

    // Constrói o histórico da conversa formatado para o prompt
    const conversationHistory = state.messages
      .map(msg => `${HumanMessage.isInstance(msg) ? 'User' : 'AI'}: ${msg.content}`)
      .join('\n')

    // Pega a última mensagem do usuário
    const userMessage = state.messages.at(-1)?.text as string

    // Prepara o prompt do usuário com a mensagem e histórico
    const userPrompt = getUserPromptTemplate(
      userMessage,
      conversationHistory,
    )

    // Chama a IA para gerar uma resposta estruturada
    const result = await llmClient.generateStructured(
      systemPrompt,
      userPrompt,
      ChatResponseSchema,  // Schema esperado: { message, preferences, shouldSavePreferences }
    )

    // Se falhou, retorna uma mensagem de erro padrão
    if (!result.success || !result.data) {
      console.error('Falha ao gerar resposta:', result.error);
      return {
        messages: [
          new AIMessage('Desculpe, encontrei um erro. Pode tentar novamente?')
        ]
      }
    }

    const response = result.data

    // Verifica se precisa resumir o histórico (baseado no total de mensagens)
    // Após o resumo, mantemos apenas 2 mensagens (1 usuário + 1 IA)
    // Disparamos quando temos 6+ mensagens (3 trocas de conversa)
    // Isso dá: 2 iniciais + 4 novas = 6 mensagens totais
    const totalMessages = state.messages.length
    const needsSummarization = totalMessages >= config.maxMessagesToSummary

    // Retorna a mensagem gerada e dados de preferências se necessário
    return {
      messages: [
        new AIMessage(response.message)  // Resposta gerada pela IA
      ],
      extractedPreferences: response.shouldSavePreferences ? response.preferences : undefined,  // Preferências para salvar
      needsSummarization,  // Indica se o histórico precisa ser resumido
    };
  };
}
