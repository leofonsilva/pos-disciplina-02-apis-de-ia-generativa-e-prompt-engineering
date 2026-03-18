import { type GraphState } from "../graph.ts";

// Nó que converte a resposta para letras minúsculas
export function lowerCaseNode(state: GraphState): GraphState {
  // Pega o texto gerado e transforma tudo em minúsculas
  const responseText = state.output.toLowerCase()

  return {
    ...state,                // Mantém o resto do estado inalterado
    output: responseText,    // Substitui apenas a resposta pela versão em minúsculas
  }
}
