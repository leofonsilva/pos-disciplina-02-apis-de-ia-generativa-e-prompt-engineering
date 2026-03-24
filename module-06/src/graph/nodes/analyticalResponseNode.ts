import { AIMessage } from "@langchain/core/messages";
import { OpenRouterService } from '../../services/openrouterService.ts';
import type { GraphState } from '../graph.ts';
import {
  AnalyticalResponseSchema,
  getErrorResponsePrompt,
  getMultiStepSynthesisPrompt,
  getNoResultsPrompt,
  getSystemPrompt,
  getUserPromptTemplate
} from '../../prompts/v1/analyticalResponse.ts';

// Função auxiliar para criar mensagens de IA no formato correto
function toMessage(content: string) {
  return new AIMessage(content ?? "").toJSON() as any;
}

// Trata respostas quando ocorreu um erro na execução anterior
async function handleErrorResponse(
  state: GraphState,
  llmClient: OpenRouterService
): Promise<Partial<GraphState>> {

  // Prepara prompts para resposta de erro
  const systemPrompt = getSystemPrompt();
  const userPrompt = getErrorResponsePrompt(state.error!, state.question);

  // Gera resposta estruturada com explicação do erro
  const { data, error } = await llmClient.generateStructured(
    systemPrompt,
    userPrompt,
    AnalyticalResponseSchema,
  );

  if (error) {
    // Fallback se falhar até a geração da resposta de erro
    return {
      messages: [toMessage(`An error occurred: ${error}`)],
      error,
      answer: `An error occurred: ${error}`,
      followUpQuestions: [],
    };
  }

  return {
    messages: [toMessage(data?.answer ?? "")],
    answer: data?.answer,
    followUpQuestions: data?.followUpQuestions,
  };
}

// Trata respostas bem-sucedidas (dados encontrados)
async function handleSuccessResponse(
  state: GraphState,
  llmClient: OpenRouterService
): Promise<Partial<GraphState>> {

  const systemPrompt = getSystemPrompt();
  let userPrompt: string;

  // Caso 1: Consulta de múltiplos passos (subconsultas encadeadas)
  if (
    state.isMultiStep &&
    state.subResults?.length &&
    state.subQuestions?.length &&
    state.subQueries?.length
  ) {
    console.log(`Synthesizing ${state.subResults.length} step results...`);

    // Prepara dados de cada etapa para síntese
    const stepsData = state.subResults.map((results, index) => ({
      stepNumber: index + 1,
      question: state.subQuestions![index],
      query: state.subQueries![index],
      results: JSON.stringify(results)
    }));

    userPrompt = getMultiStepSynthesisPrompt(state.question!, stepsData);

  } else {
    // Caso 2: Consulta simples (única query)
    userPrompt = getUserPromptTemplate(
      state.question!,
      state.query!,
      JSON.stringify(state.dbResults)
    );
  }

  // Gera resposta analítica estruturada
  const { data, error } = await llmClient.generateStructured(
    systemPrompt,
    userPrompt,
    AnalyticalResponseSchema,
  );

  if (error) {
    return {
      error: `Response generation failed: ${error}`
    };
  }

  console.log('Generated analytical response');

  return {
    messages: [toMessage(data?.answer ?? "")],
    answer: data?.answer,
    followUpQuestions: data?.followUpQuestions,
  };
}

// Trata respostas quando nenhum dado foi encontrado no banco
async function handleNoResultsResponse(
  state: GraphState,
  llmClient: OpenRouterService,
): Promise<Partial<GraphState>> {

  console.log('Generating no-results response...');

  const systemPrompt = getSystemPrompt();
  const userPrompt = getNoResultsPrompt(
    state.question ?? 'your query',
    state.query ?? 'N/A'
  );

  // Gera resposta educada informando que não há dados
  const { data, error } = await llmClient.generateStructured(
    systemPrompt,
    userPrompt,
    AnalyticalResponseSchema,
  );

  if (data) {
    return {
      messages: [toMessage(data.answer)],
      answer: data.answer,
      followUpQuestions: data.followUpQuestions,
    };
  }

  // Fallback se falhar na geração
  const fallback = "No data found matching your query.";

  return {
    messages: [toMessage(fallback)],
    error,
    answer: fallback,
    followUpQuestions: [],
  };
}

// Factory que cria o nó de resposta analítica para o grafo
export function createAnalyticalResponseNode(llmClient: OpenRouterService) {
  return async (state: GraphState): Promise<Partial<GraphState>> => {
    try {
      // Roteia para o handler apropriado baseado no estado
      if (state.error) {
        return await handleErrorResponse(state, llmClient);
      }

      if (!state.dbResults?.length) {
        return await handleNoResultsResponse(state, llmClient);
      }

      return await handleSuccessResponse(state, llmClient);

    } catch (error: any) {
      console.error('Error generating analytical response:', error.message);

      return {
        error: `Response generation failed: ${error.message}`,
      };
    }
  };
}
