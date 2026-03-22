import { PromptTemplate } from '@langchain/core/prompts';
import { OpenRouterService } from '../../services/openrouterService.ts';
import type { GraphState } from '../state.ts';
import { prompts } from '../../config.ts';

// Factory que cria um nó para verificar mensagens com guardrails de segurança
export const createGuardrailsCheckNode = (openRouterService: OpenRouterService) => {
  return async (state: GraphState): Promise<Partial<GraphState>> => {
    try {
      // Pega a última mensagem do usuário
      const userPrompt = state.messages.at(-1)?.text!

      // Cria template para o prompt do sistema
      const template = PromptTemplate.fromTemplate(prompts.system)

      // MÉTODO INSEGURO (comentado) - substituição direta de string
      // const systemPrompt = prompts.system
      //  .replace('{USER_ROLE}', state.user.role);
      //  .replace('{USER_NAME}', state.user.displayName);

      // MÉTODO SEGURO - usa template do LangChain
      const systemPrompt = await template.format({
        USER_ROLE: state.user.role,
        USER_NAME: state.user.displayName
      })

      // Combina prompt do sistema com a mensagem do usuário
      const msg = systemPrompt.concat('\n', userPrompt)

      // Chama o serviço para verificar se a mensagem é segura
      const result = await openRouterService.checkGuardRails(
        msg,
        state.guardrailsEnabled,  // Se false, a verificação pode ser ignorada
      )

      // Retorna o resultado da verificação para o estado
      return {
        guardrailCheck: result  // Contém { safe: boolean, reason?: string, analysis?: string }
      };
    } catch (error) {
      // Em caso de erro no serviço, bloqueia por segurança (fail closed)
      console.error('Guardrails check failed:', error);

      return {
        guardrailCheck: {
          reason: 'Guardrails service unavailable - request blocked for safety',
          safe: false,  // Bloqueia a mensagem para garantir segurança
        }
      };
    }
  }
}
