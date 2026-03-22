import { buildChatGraph } from './graph.ts';

// Constrói o grafo de chat (ponto de entrada simplificado)
export async function buildGraph() {
  return buildChatGraph();
}

// Versão síncrona da função (retorna Promise, mas nome sugere chamada direta)
export const graph = () => buildChatGraph();
