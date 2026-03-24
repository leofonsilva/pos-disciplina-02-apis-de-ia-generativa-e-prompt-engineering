import { StateGraph, START, END, MessagesZodMeta } from '@langchain/langgraph';
import { withLangGraph } from "@langchain/langgraph/zod";

import { z } from 'zod/v3';
import type { BaseMessage } from '@langchain/core/messages';

import { OpenRouterService } from '../services/openrouterService.ts';
import { createAnswerGenerationNode } from './nodes/answerGenerationNode.ts';

// Define a estrutura de estado do grafo de QA de documentos
const DocumentQAStateAnnotation = z.object({
  // Entrada
  messages: withLangGraph(
    z.custom<BaseMessage[]>(),
    MessagesZodMeta),                    // Histórico de mensagens (perguntas do usuário)

  // Processamento do documento (armazenado em base64 para modelos multimodais)
  documentBase64: z.string().optional(),  // Documento codificado (imagem, PDF)

  // Tratamento de erro
  error: z.string().optional(),
});

export type GraphState = z.infer<typeof DocumentQAStateAnnotation>;

// Constrói o grafo de QA de documentos (fluxo linear)
export function buildDocumentQAGraph(
  llmClient: OpenRouterService) {
  const workflow = new StateGraph({
    stateSchema: DocumentQAStateAnnotation,
  })
    // Único nó: gera resposta baseada no documento e na pergunta
    .addNode('answerGeneration', createAnswerGenerationNode(llmClient))

    // Fluxo linear: START → answerGeneration → END
    .addEdge(START, 'answerGeneration')
    .addEdge('answerGeneration', END);

  // Compila e retorna o grafo pronto para execução
  return workflow.compile();
}
