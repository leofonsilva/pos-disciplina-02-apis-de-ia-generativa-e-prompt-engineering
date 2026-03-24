import config from '../../config.ts';
import { Neo4jService } from '../../services/neo4jService.ts';
import type { GraphState } from '../graph.ts';

// Função auxiliar que executa a query e retorna resultados ou erro
async function executeQuery(
  query: string,
  neo4jService: Neo4jService
) {
  try {
    // Valida a sintaxe da query antes de executar
    const isValid = await neo4jService.validateQuery(query)
    if (!isValid) {
      return {
        results: null,
        error: 'Query validation failed - syntax or structure error'
      }
    }

    // Executa a query no banco
    const results = await neo4jService.query(query)
    if (!results.length) {
      return {
        results: [],
        error: 'No results found'
      }
    }

    console.log(`Retrieved ${results.length} result(s)`);
    return {
      results,
      error: null
    }

  } catch (error: any) {
    // Captura erros de execução (ex: erro de sintaxe no banco)
    return {
      results: null,
      error: error?.message ?? 'Query execution error'
    }
  }
}

// Verifica se ainda existem subconsultas a serem executadas
function hasMoreSteps(state: GraphState): boolean {
  if (!state.isMultiStep || !state.subQuestions?.length || state.currentStep === undefined) {
    return false;
  }

  return state.currentStep < state.subQuestions.length;
}

// Gerencia o progresso em consultas de múltiplos passos
function handleMultiStepProgression(state: GraphState, results: any[]) {
  // Acumula os resultados de todos os passos já executados
  const updatedSubResults = [
    ...state.subResults ?? [],
    ...results
  ]

  // Avança para o próximo passo
  const nextStep = (state.currentStep ?? 0) + 1
  const multiStepState = {
    dbResults: results,
    subResults: updatedSubResults,
    currentStep: nextStep,
    needsCorrection: false,
  }

  const totalSteps = state.subQuestions?.length ?? 0
  console.log(`Step ${multiStepState.currentStep}/${totalSteps} completed`);

  // Se ainda há passos, continua; senão, aguarda síntese final
  if (hasMoreSteps({ ...state, ...multiStepState })) {
    console.log(`Moving to step ${nextStep}...`);
    return multiStepState
  }

  console.log(`All ${totalSteps} steps completed - synthesizing results`);
  return multiStepState
}

// Factory que cria o nó executor de queries Cypher
export function createCypherExecutorNode(neo4jService: Neo4jService) {

  return async (state: GraphState): Promise<Partial<GraphState>> => {
    try {
      // Executa a query atual
      const { results, error } = await executeQuery(state.query!, neo4jService)

      // Caso 1: Erro fatal (query inválida)
      if (error && results === null) {
        // Tenta autocorrigir se ainda houver tentativas disponíveis
        if ((state.correctionAttempts ?? 0) < config.maxCorrectionAttempts) {
          console.log('Will attempt to auto-correct query...');
          return {
            validationError: error,
            originalQuery: state.originalQuery ?? state.query,
            needsCorrection: true,   // Sinaliza que precisa de correção
          }
        }
        // Esgotou tentativas de correção
        return {
          ...state,
          error: 'Invalid Cypher query - correction failed',
        };
      }

      // Caso 2: Consulta multi-step (múltiplas subconsultas encadeadas)
      if (state.isMultiStep && state.subQuestions?.length && state.currentStep !== undefined) {
        const multiStepState = handleMultiStepProgression(state, results!)
        return {
          ...multiStepState,
        }
      }

      // Caso 3: Nenhum resultado encontrado
      if (!results?.length) {
        return {
          dbResults: [],
          error: 'No results found'
        }
      }

      // Caso 4: Sucesso - resultados obtidos
      return {
        ...state,
        dbResults: results,
        needsCorrection: false,
      };

    } catch (error) {
      console.error('Error executing Cypher query:', error instanceof Error ? error.message : error);
      return {
        ...state,
        error: 'Invalid Cypher query - correction failed',
      };
    }
  }
};
