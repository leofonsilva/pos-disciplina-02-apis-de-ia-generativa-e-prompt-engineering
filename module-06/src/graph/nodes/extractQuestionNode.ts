import type { GraphState } from '../graph.ts';

// Factory que cria um nó para extrair a pergunta do usuário do histórico de mensagens
export function createExtractQuestionNode() {

  return async (state: GraphState): Promise<Partial<GraphState>> => {
    try {
      // Verifica se há mensagens no estado
      if (!state.messages?.length) {
        console.error('No messages in state');
        return {
          ...state,
          error: 'No messages provided',
        };
      }

      // Pega a última mensagem (mensagem mais recente do usuário)
      const question = state.messages.at(-1)?.text ?? '';

      // Verifica se a pergunta não está vazia
      if (!question.trim()) {
        console.error('Extracted question is empty');
        return {
          ...state,
          error: 'No valid question found in messages',
        };
      }

      console.log(`Extracted question: "${question}"`);

      // Retorna o estado com a pergunta extraída
      return {
        ...state,
        question,  // Adiciona a pergunta ao estado para uso nos próximos nós
      };

    } catch (error: any) {
      console.error('Error extracting question:', error.message);
      return {
        ...state,
        error: `Failed to extract question: ${error.message}`,
      };
    }
  };
}
