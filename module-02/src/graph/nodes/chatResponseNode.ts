import { AIMessage } from "langchain";
import { type GraphState } from "../graph.ts";

// Nó final que prepara a resposta para ser enviada ao usuário
export function chatResponseNode(state: GraphState): GraphState {
  // Pega o texto gerado nas etapas anteriores
  const responseText = state.output
  
  // Converte o texto para o formato de mensagem da IA
  const aiMessage = new AIMessage(responseText)

  return {
    ...state,                       // Mantém o estado original
    messages: [
      ...state.messages,            // Preserva todo o histórico da conversa
      aiMessage,                    // Adiciona a resposta da IA ao histórico
    ]
  }
}
