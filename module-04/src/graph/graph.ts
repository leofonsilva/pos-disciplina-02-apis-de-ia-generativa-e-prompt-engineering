import { StateGraph, START, END, MessagesZodMeta } from "@langchain/langgraph";
import { withLangGraph } from "@langchain/langgraph/zod";
import { z } from "zod/v3";

import type { BaseMessage } from '@langchain/core/messages';
import { OpenRouterService } from '../services/openrouterService.ts';
import { createChatNode } from './nodes/chatNode.ts';
import { createSummarizationNode } from './nodes/summarizationNode.ts';
import { createSavePreferencesNode } from './nodes/savePreferencesNode.ts';
import { routeAfterChat, routeAfterSavePreferences } from './nodes/edgeConditions.ts';
import { PreferencesService } from "../services/preferencesService.ts";
import { type MemoryService } from "../services/memoryService.ts";

// Define a estrutura de dados do estado do grafo de chat
const ChatStateAnnotation = z.object({
  messages: withLangGraph(
    z.custom<BaseMessage[]>(),
    MessagesZodMeta),                      // Histórico de mensagens da conversa
  userContext: z.string().optional(),       // Contexto do usuário (nome, idioma, etc.)
  extractedPreferences: z.any().optional(), // Preferências extraídas da conversa
  needsSummarization: z.boolean().optional(), // Indica se precisa resumir o histórico
  conversationSummary: z.any().optional(),   // Resumo da conversa acumulado
  userId: z.string().optional(),             // Identificador do usuário
});

export type GraphState = z.infer<typeof ChatStateAnnotation>;

// Constrói o grafo de chat com nós e fluxos definidos
export function buildChatGraph(
  llmClient: OpenRouterService,           // Serviço de IA
  preferencesService: PreferencesService, // Serviço de preferências
  memoryService: MemoryService,            // Serviço de memória (checkpointer e store)
) {
  const graph = new StateGraph(ChatStateAnnotation)
    // Adiciona os nós de processamento
    .addNode('chat', createChatNode(llmClient, preferencesService))           // Gera resposta da IA
    .addNode('savePreferences', createSavePreferencesNode(preferencesService)) // Salva preferências do usuário
    .addNode('summarize', createSummarizationNode(llmClient, preferencesService)) // Resume histórico longo

    // Fluxo: começa sempre no nó de chat
    .addEdge(START, 'chat')

    // Roteamento após o chat: pode ir para savePreferences, summarize ou finalizar
    .addConditionalEdges(
      'chat',
      routeAfterChat,
      {
        savePreferences: 'savePreferences',
        summarize: 'summarize',
        end: END,
      }
    )

    // Roteamento após salvar preferências: pode ir para summarize ou finalizar
    .addConditionalEdges(
      'savePreferences',
      routeAfterSavePreferences,
      {
        summarize: 'summarize',
        end: END,
      }
    )

    // Após resumir, finaliza
    .addEdge('summarize', END);

  // Compila o grafo com checkpointer (salva estado) e store (armazena memória)
  return graph.compile({
    checkpointer: memoryService.checkpointer, // Para salvar estado da conversa
    store: memoryService.store,               // Para armazenamento de longo prazo
  });
}
