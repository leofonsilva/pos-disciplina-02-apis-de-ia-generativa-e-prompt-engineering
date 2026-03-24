import { StateGraph, START, END, MessagesZodMeta } from '@langchain/langgraph';
import { withLangGraph } from "@langchain/langgraph/zod";

import { z } from 'zod/v3';
import type { BaseMessage } from '@langchain/core/messages';

import { Neo4jService } from '../services/neo4jService.ts';
import { OpenRouterService } from '../services/openrouterService.ts';

import { createCypherGeneratorNode } from './nodes/cypherGeneratorNode.ts';
import { createCypherExecutorNode } from './nodes/cypherExecutorNode.ts';
import { createCypherCorrectionNode } from './nodes/cypherCorrectionNode.ts';
import { createQueryPlannerNode } from './nodes/queryPlannerNode.ts';
import { createAnalyticalResponseNode } from './nodes/analyticalResponseNode.ts';
import { createExtractQuestionNode } from './nodes/extractQuestionNode.ts';

// Define a estrutura de estado do grafo de análise de vendas
const SalesStateAnnotation = z.object({
  // Entrada
  messages: withLangGraph(
    z.custom<BaseMessage[]>(),
    MessagesZodMeta),                    // Histórico de mensagens
  question: z.string().optional(),       // Pergunta extraída do usuário

  // Geração de Cypher
  query: z.string().optional(),          // Query atual
  originalQuery: z.string().optional(),  // Query original (antes da correção)

  // Execução da query
  dbResults: z.array(z.any()).optional(), // Resultados do banco

  // Autocorreção
  correctionAttempts: z.number().optional(), // Número de tentativas de correção
  validationError: z.string().optional(),    // Erro de validação
  needsCorrection: z.boolean().optional(),   // Indica se precisa corrigir

  // Decomposição multi-step
  isMultiStep: z.boolean().optional(),              // Se é consulta de múltiplos passos
  subQuestions: z.array(z.string()).optional(),     // Subperguntas
  currentStep: z.number().optional(),               // Passo atual
  subQueries: z.array(z.string()).optional(),       // Queries geradas para cada passo
  subResults: z.array(z.array(z.any())).optional(), // Resultados de cada passo

  // Geração de resposta
  answer: z.string().optional(),                     // Resposta final
  followUpQuestions: z.array(z.string()).optional(), // Perguntas sugeridas

  // Tratamento de erro
  error: z.string().optional(),
});

export type GraphState = z.infer<typeof SalesStateAnnotation>;

// Constrói o grafo de análise de vendas com todos os nós e fluxos
export function buildSalesGraph(
  llmClient: OpenRouterService,
  neo4jService: Neo4jService
) {
  const workflow = new StateGraph({
    stateSchema: SalesStateAnnotation,
  })
    // Adiciona os nós do grafo
    .addNode('extractQuestion', createExtractQuestionNode())                          // Extrai pergunta do histórico
    .addNode('queryPlanner', createQueryPlannerNode(llmClient))                       // Analisa e planeja (multi-step)
    .addNode('cypherGenerator', createCypherGeneratorNode(llmClient, neo4jService))   // Gera query Cypher
    .addNode('cypherExecutor', createCypherExecutorNode(neo4jService))                // Executa query no banco
    .addNode('cypherCorrection', createCypherCorrectionNode(llmClient, neo4jService)) // Corrige query com erro
    .addNode('analyticalResponse', createAnalyticalResponseNode(llmClient))           // Gera resposta final

    // Ponto de entrada
    .addEdge(START, 'extractQuestion')

    // Se erro na extração, finaliza; senão vai para planejamento
    .addConditionalEdges('extractQuestion', (state: GraphState) => {
      if (state.error) return END;
      return 'queryPlanner';
    })

    // Fluxo linear após planejamento
    .addEdge('queryPlanner', 'cypherGenerator')
    .addEdge('cypherGenerator', 'cypherExecutor')

    // Roteamento após execução da query
    .addConditionalEdges('cypherExecutor', (state: GraphState) => {
      // Caso 1: Precisa corrigir e ainda há tentativas disponíveis
      if (state.needsCorrection && (!state.correctionAttempts || state.correctionAttempts < 1)) {
        return 'cypherCorrection';
      }

      // Caso 2: Consulta multi-step com mais passos pendentes
      if (state.isMultiStep && state.subQuestions && state.currentStep !== undefined) {
        if (state.currentStep < state.subQuestions.length) {
          return 'cypherGenerator';  // Volta para gerar query do próximo passo
        }
      }

      // Caso 3: Finalizado (sucesso ou erro fatal)
      return 'analyticalResponse';
    })

    // Após correção, volta para execução
    .addEdge('cypherCorrection', 'cypherExecutor')

    // Após resposta final, finaliza
    .addEdge('analyticalResponse', END);

  // Compila e retorna o grafo pronto para execução
  return workflow.compile();
}
