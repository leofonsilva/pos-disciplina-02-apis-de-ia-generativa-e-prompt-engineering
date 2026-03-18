import { AIMessage, SystemMessage } from "langchain";
import { type GraphState } from "../graph.ts";

// Nó executado quando o usuário não usou um comando válido
export function fallbackNode(state: GraphState): GraphState {
  // Mensagem amigável explicando os comandos disponíveis
  const message = "Unknown command. Try 'make this uppercase' or 'convert to lowercase'";
  
  // Converte a mensagem para o formato de resposta da IA
  const fallbackMessage = new AIMessage(message).content.toString()
  
  return {
    ...state,                            // Mantém o estado original
    output: fallbackMessage,             // Define a mensagem de ajuda como resposta
    messages: [
      ...state.messages,                 // Preserva o histórico da conversa
      // new SystemMessage('hey there')  // Opção de adicionar mensagem do sistema (comentada)
    ]
  }
}
