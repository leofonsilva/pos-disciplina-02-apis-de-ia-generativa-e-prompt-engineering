import type { Runtime } from '@langchain/langgraph';
import type { GraphState } from '../graph.ts';
import { PreferencesService } from '../../services/preferencesService.ts';

// Factory que cria um nó para salvar as preferências do usuário
export function createSavePreferencesNode(preferencesService: PreferencesService) {
  return async (state: GraphState, runtime?: Runtime): Promise<Partial<GraphState>> => {
    // Se não há preferências para salvar, não faz nada
    if (!state.extractedPreferences) return {}

    // Obtém o ID do usuário (do contexto de execução ou do estado)
    const userId = String(runtime?.context?.userId || state.userId || 'unknown')

    // Salva as preferências extraídas no serviço de preferências
    await preferencesService.mergePreferences(userId, state.extractedPreferences)

    // Retorna o estado sem as preferências (já foram salvas)
    return {
      extractedPreferences: undefined
    };
  };
}
