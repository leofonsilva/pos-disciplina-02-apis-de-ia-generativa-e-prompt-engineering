import type { GraphState } from '../graph.ts';

// Decide o próximo nó após o chat com base nas flags de estado
export const routeAfterChat = (state: GraphState): string =>
  state.extractedPreferences ? 'savePreferences' :   // Se tem preferências para salvar, vai para savePreferences
    state.needsSummarization ? 'summarize' :           // Se precisa resumir histórico, vai para summarize
      'end';                                              // Caso contrário, finaliza

// Decide o próximo nó após salvar preferências
export const routeAfterSavePreferences = (state: GraphState): string =>
  state.needsSummarization ? 'summarize' :   // Se precisa resumir, vai para summarize
    'end';                                      // Caso contrário, finaliza