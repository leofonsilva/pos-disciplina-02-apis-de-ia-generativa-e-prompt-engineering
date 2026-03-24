import { OpenRouterService } from '../services/openrouterService.ts';
import { buildDocumentQAGraph } from './graph.ts';

// Constrói e configura o grafo de QA de documentos com todas as dependências
export function buildDocumentQAGraphInstance() {
  // Cria o cliente OpenRouter para chamadas de IA (suporte multimodal)
  const llmClient = new OpenRouterService();

  // Retorna o grafo compilado e o cliente (útil para testes e acesso externo)
  return {
    graph: buildDocumentQAGraph(llmClient),  // Grafo pronto para execução
    llmClient,                               // Cliente IA exposto para uso externo
  }
}

// Exporta uma instância do grafo pronta para uso
export const graph = buildDocumentQAGraphInstance();
