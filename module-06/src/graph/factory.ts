import { OpenRouterService } from '../services/openrouterService.ts';
import { Neo4jService } from '../services/neo4jService.ts';
import { buildSalesGraph } from './graph.ts';

// Constrói e configura o grafo de análise de vendas com todas as dependências
export function buildSalesQAGraph() {
  // Cria o cliente OpenRouter para chamadas de IA (geração e correção de queries)
  const llmClient = new OpenRouterService();

  // Cria o serviço Neo4j para interagir com o banco de dados
  const neo4jService = new Neo4jService();

  // Retorna o grafo compilado e os serviços (úteis para testes e acesso externo)
  return {
    graph: buildSalesGraph(llmClient, neo4jService),  // Grafo pronto para execução
    llmClient,      // Cliente IA exposto para uso externo
    neo4jService,   // Serviço Neo4j exposto para uso externo
  }
}

// Exporta uma instância do grafo pronta para uso
export const graph = buildSalesQAGraph();
