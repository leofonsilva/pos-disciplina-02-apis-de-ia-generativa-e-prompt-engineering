import { OpenRouterService } from '../services/openrouterService.ts';
import { config } from '../config.ts';
import { buildChatGraph } from './graph.ts';
import { createMemoryService } from '../services/memoryService.ts';
import { PreferencesService } from '../services/preferencesService.ts';

// Constrói o grafo de chat com todas as dependências
export async function buildGraph(dbPath: string = './preferences.db') {
  // Cria o cliente OpenRouter para chamadas de IA
  const llmClient = new OpenRouterService(config);

  // Cria o serviço de memória para gerenciar histórico de conversas
  const memoryService = await createMemoryService()

  // Cria o serviço de preferências para salvar dados do usuário
  const preferencesService = new PreferencesService(dbPath)

  // Monta o grafo com todos os serviços injetados
  const graph = buildChatGraph(
    llmClient,
    preferencesService,
    memoryService
  );

  // Retorna o grafo e o serviço de preferências (útil para testes)
  return {
    graph,
    preferencesService,
  };
}

// Exporta uma função assíncrona que cria e retorna o grafo
export const graph = async () => buildGraph();
export default graph;
