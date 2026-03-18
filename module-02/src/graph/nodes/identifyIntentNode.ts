import { type GraphState } from "../graph.ts";

// Nó que identifica a intenção do usuário baseado na mensagem enviada
export function identifyIntent(state: GraphState): GraphState {
  // Pega a última mensagem do usuário no histórico
  const input = state.messages.at(-1)?.text ?? ""
  const inputLower = input.toLowerCase()

  // Define o comando padrão como 'unknown'
  let command: GraphState['command'] = 'unknown'

  // Verifica palavras-chave para identificar se é um comando
  if (inputLower.includes('upper')) {
    command = 'uppercase'     // Se contém "upper", comando de maiúsculas
  } else if (inputLower.includes('lower')) {
    command = 'lowercase'     // Se contém "lower", comando de minúsculas
  }

  return {
    ...state,                 // Mantém o estado original
    command,                  // Adiciona a intenção identificada
    output: input             // Copia a mensagem original para output
  }
}
