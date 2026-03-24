import { OpenRouterService } from '../../services/openrouterService.ts';
import { Neo4jService } from '../../services/neo4jService.ts';
import type { GraphState } from '../graph.ts';
import { CypherQuerySchema, getSystemPrompt, getUserPromptTemplate } from '../../prompts/v1/cypherGenerator.ts';
import { SALES_CONTEXT } from '../../prompts/v1/salesContext.ts';

// Obtém a pergunta atual quando em uma consulta de múltiplos passos
function getCurrentStepQuestion(state: GraphState) {
  // Se não é multi-step ou não tem subconsultas, retorna null
  if (!state.isMultiStep || !state.subQuestions?.length || state.currentStep === undefined) {
    return null
  }

  // Se já passou do número de subconsultas, retorna null
  if (state.currentStep >= state.subQuestions.length) {
    return null
  }

  // Retorna a pergunta atual e o número do passo (para logging)
  return {
    question: state.subQuestions[state.currentStep],
    stepNumber: state.currentStep + 1
  }
}

// Factory que cria um nó para gerar queries Cypher a partir de perguntas em linguagem natural
export function createCypherGeneratorNode(
  llmClient: OpenRouterService,
  neo4jService: Neo4jService,
) {

  return async (state: GraphState): Promise<Partial<GraphState>> => {
    try {
      // Determina qual pergunta deve ser traduzida para Cypher
      const stepInfo = getCurrentStepQuestion(state)
      const targetQuestion = stepInfo?.question ?? state.question!

      // Logs informativos sobre o passo atual (multi-step ou single)
      if (stepInfo) {
        const totalSteps = state.subQuestions?.length ?? 0;
        console.log(`Generating Cypher query for step ${stepInfo.stepNumber}/${totalSteps}: "${targetQuestion}"`);
      } else {
        console.log('Generating Cypher query...');
      }

      // Obtém o esquema do banco (labels, relacionamentos, propriedades)
      const schema = await neo4jService.getSchema()

      // Prepara prompts para geração da query
      const systemPrompt = await getSystemPrompt(schema, SALES_CONTEXT)  // Inclui esquema e contexto de vendas
      const userPrompt = await getUserPromptTemplate(targetQuestion)      // Pergunta do usuário

      // Chama a IA para gerar a query Cypher estruturada
      const { data, error } = await llmClient.generateStructured(
        systemPrompt,
        userPrompt,
        CypherQuerySchema,  // Retorna { query, explanation }
      )

      if (error) {
        return {
          error: `Failed to generate query: ${error ?? 'Unknown error'}`,
        }
      }

      console.log(`Generated Cypher query: ${data?.query}`);

      // Caso multi-step: acumula queries em array para referência futura
      if (state.isMultiStep && state.subQueries?.length) {
        return {
          query: data?.query,
          subQueries: [...state.subQueries, data?.query ?? ""]  // Adiciona à lista de subqueries
        }
      }

      // Caso single-step: apenas retorna a query gerada
      return {
        query: data?.query,
      };

    } catch (error: any) {
      console.error('Error generating Cypher query:', error.message);
      return {
        ...state,
        error: `Failed to generate query: ${error.message}`,
      };
    }
  };
}
