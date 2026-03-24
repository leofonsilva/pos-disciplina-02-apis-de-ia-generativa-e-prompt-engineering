import { getSystemPrompt, getUserPromptTemplate, QueryAnalysisSchema } from '../../prompts/v1/queryAnalyzer.ts';
import { OpenRouterService } from '../../services/openrouterService.ts';
import type { GraphState } from '../graph.ts';

// Factory que cria um nó para analisar e planejar a execução da consulta
export function createQueryPlannerNode(llmClient: OpenRouterService) {

  return async (state: GraphState): Promise<Partial<GraphState>> => {

    try {
      // Prepara prompts para análise da pergunta
      const systemPrompt = getSystemPrompt()
      const userPrompt = getUserPromptTemplate(state.question!)

      // Chama a IA para analisar a pergunta e determinar se precisa ser decomposta
      const { data, error } = await llmClient.generateStructured(
        systemPrompt,
        userPrompt,
        QueryAnalysisSchema,  // Retorna { requiresDecomposition, subQuestions }
      )

      // Se falhou na análise, assume consulta simples (single-step)
      if (error) {
        console.log('Failed to analyze query, assuming simple');
        return {
          ...state,
          error,
          isMultiStep: false,
        }
      }

      // Se é uma consulta complexa que requer múltiplos passos
      if (data?.requiresDecomposition && !!data.subQuestions?.length) {
        // Formata as subperguntas para exibição no log
        const subQuestionsFormatted = data.subQuestions
          .map((q: string, i: number) => `\n   ${i + 1}. ${q}`)
          .join('');

        console.log(`Complex query - ${data.subQuestions.length} steps:${subQuestionsFormatted}`);

        // Configura estado para execução multi-step
        return {
          isMultiStep: true,           // Marca como consulta de múltiplos passos
          subQuestions: data.subQuestions,  // Lista de subperguntas
          currentStep: 0,              // Começa no primeiro passo
          subQueries: [],              // Array para acumular queries geradas
          subResults: []               // Array para acumular resultados
        }
      }

      // Consulta simples (single-step) - mantém estado original
      return {
        ...state,
      };

    } catch (error: any) {
      console.error('Error analyzing query:', error.message);
      return {
        ...state,
        isMultiStep: false,
      };
    }
  }
}
