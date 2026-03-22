import type { GraphState } from '../state.ts';
import { AIMessage } from '@langchain/core/messages';
import { OpenRouterService } from '../../services/openrouterService.ts';
import { PromptTemplate } from '@langchain/core/prompts';
import { getUser, prompts } from '../../config.ts';

// Factory que cria um nó de chat com um cliente OpenRouter
export const createChatNode = (openRouterService: OpenRouterService) => {
  return async (state: GraphState): Promise<Partial<GraphState>> => {
    try {
      // Configura valores padrão quando executado no LangSmith Studio
      // (ambiente de teste que não tem usuário definido)
      // Não replicar isso em produção, é apenas teste
      if (!state.user) {
        state.user = getUser('tamara')!;  // Usuário de exemplo
        state.guardrailsEnabled = false;    // Desativa guardrails em testes
      }

      // Pega a última mensagem do usuário
      const userPrompt = state.messages.at(-1)?.text!

      // Cria template para o prompt do sistema
      const template = PromptTemplate.fromTemplate(prompts.system)

      // MÉTODO INSEGURO (comentado) - substituição direta de string
      // const systemPrompt = prompts.system
      //  .replace('{USER_ROLE}', state.user.role);
      //  .replace('{USER_NAME}', state.user.displayName);

      // MÉTODO SEGURO - usa template do LangChain (escapa caracteres especiais)
      const systemPrompt = await template.format({
        USER_ROLE: state.user.role,
        USER_NAME: state.user.displayName
      })

      // Chama o serviço OpenRouter para gerar a resposta
      const response = await openRouterService.generate(
        systemPrompt,
        userPrompt,
      )

      // Retorna a resposta como mensagem da IA
      return {
        messages: [new AIMessage(response)],
      };
    } catch (error) {
      // Em caso de erro, retorna mensagem amigável
      console.error('Chat node error:', error);
      return {
        messages: [new AIMessage('I apologize, but I encountered an error processing your request. Please try again later.')],
      };
    }
  }
}
