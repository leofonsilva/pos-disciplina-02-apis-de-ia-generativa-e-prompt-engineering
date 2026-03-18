import { type GraphState } from "../graph.ts";

// Nó que converte a resposta para letras maiúsculas
export function upperCaseNode(state: GraphState): GraphState {
  // Pega o texto gerado e transforma tudo em maiúsculas
  const responseText = state.output.toUpperCase()

  return {
    ...state,                // Mantém o resto do estado inalterado
    output: responseText,    // Substitui apenas a resposta pela versão em maiúsculas
  }
}
