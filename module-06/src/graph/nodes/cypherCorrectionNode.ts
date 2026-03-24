import { OpenRouterService } from '../../services/openrouterService.ts';
import { Neo4jService } from '../../services/neo4jService.ts';
import type { GraphState } from '../graph.ts';
import { CypherCorrectionSchema, getSystemPrompt, getUserPromptTemplate } from '../../prompts/v1/cypherCorrection.ts';

// Factory que cria um nó para corrigir queries Cypher com erro de sintaxe
export function createCypherCorrectionNode(
  llmClient: OpenRouterService,
  neo4jService: Neo4jService,
) {

  return async (state: GraphState): Promise<Partial<GraphState>> => {

    try {
      console.log('Auto-correcting Cypher query...');

      // Obtém o esquema do banco (labels, relacionamentos) para ajudar na correção
      const schema = await neo4jService.getSchema()

      // Prepara prompts para correção
      const systemPrompt = getSystemPrompt(schema)           // Inclui esquema do banco
      const userPrompt = getUserPromptTemplate(
        state.query!,                // Query original com erro
        state.validationError!,      // Mensagem de erro do Neo4j
        state.question,              // Pergunta original do usuário
      )

      // Chama a IA para gerar uma versão corrigida da query
      const { data, error } = await llmClient.generateStructured(
        systemPrompt,
        userPrompt,
        CypherCorrectionSchema,  // Retorna { correctedQuery, explanation }
      )

      if (error) {
        return {
          ...state,
          error: `Query correction failed: ${error ?? 'Unknown error'}`,
        };
      }

      console.log(`Query corrected: ${data?.explanation}`);

      // Retorna o estado com a query corrigida e contador de tentativas incrementado
      return {
        ...state,
        query: data?.correctedQuery,                              // Query corrigida
        originalQuery: state.originalQuery ?? state.query,        // Mantém query original
        correctionAttempts: (state.correctionAttempts ?? 0) + 1,  // Incrementa tentativas
        validationError: undefined,                               // Limpa erro
        needsCorrection: false,                                   // Correção concluída
      };

    } catch (error: any) {
      console.error('Error correcting query:', error.message);
      return {
        ...state,
        error: `Query correction failed: ${error.message}`,
      };
    }
  };
}
