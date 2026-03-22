import { PromptTemplate } from '@langchain/core/prompts';
import type { GraphState } from '../state.ts';
import { prompts } from '../../config.ts';
import { AIMessage } from 'langchain';

// Nó executado quando uma mensagem é bloqueada pelo guardrail (segurança)
export async function blockedNode(state: GraphState): Promise<Partial<GraphState>> {
  // Extrai informações da verificação de segurança que causou o bloqueio
  const guardRailCheck = state.guardrailCheck!

  // Adiciona análise detalhada se disponível
  const analysis = guardRailCheck.analysis ? `**Analysis:** ${guardRailCheck.analysis}` : ''

  // Lista de permissões do usuário (se houver)
  const permissions = state.user.permissions?.join(', ') ?? 'None'

  // Prepara o template com a mensagem de bloqueio
  const template = PromptTemplate.fromTemplate(prompts.blocked)

  // Formata a mensagem com os detalhes do bloqueio
  const blockedMessage = await template.format({
    REASON: guardRailCheck.reason ?? 'Security check failed',  // Motivo do bloqueio
    ANALYSIS: analysis,                                        // Análise detalhada (opcional)
    USER_ROLE: state.user.role,                                // Papel do usuário (admin, user, etc.)
    PERMISSIONS: permissions                                   // Permissões do usuário
  })

  // Retorna a mensagem de bloqueio para o usuário
  return {
    messages: [new AIMessage(blockedMessage)]
  };
}
