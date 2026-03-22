import type { GraphState } from '../state.ts';

// Decide o próximo nó após a verificação de segurança (guardrails)
export function routeAfterGuardrails(state: GraphState): 'chat' | 'blocked' {
  // Caso 1: Guardrails desabilitados - segue direto para o chat
  if (!state.guardrailsEnabled) {
    return 'chat';
  }

  // Caso 2: Guardrails habilitados e mensagem segura - vai para o chat
  const check = state.guardrailCheck;
  if (!check || check.safe) {
    return 'chat';
  }

  // Caso 3: Guardrails habilitados e mensagem insegura - bloqueia
  return 'blocked';
}
