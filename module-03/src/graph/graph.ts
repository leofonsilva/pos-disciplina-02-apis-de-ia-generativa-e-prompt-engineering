import { StateGraph, START, END, MessagesZodMeta } from "@langchain/langgraph";
import { withLangGraph } from "@langchain/langgraph/zod";
import type { BaseMessage } from '@langchain/core/messages';

import { createSchedulerNode } from './nodes/schedulerNode.ts';
import { createCancellerNode } from './nodes/cancellerNode.ts';
import { createIdentifyIntentNode } from "./nodes/identifyIntentNode.ts";
import { createMessageGeneratorNode } from "./nodes/messageGeneratorNode.ts";

import { z } from "zod/v3";
import { OpenRouterService } from "../services/openRouterService.ts";
import { AppointmentService } from "../services/appointmentService.ts";

// Define a estrutura de dados que será passada entre os nós do grafo de agendamento
const AppointmentStateAnnotation = z.object({
  // Histórico da conversa
  messages: withLangGraph(
    z.custom<BaseMessage[]>(),
    MessagesZodMeta),

  // Dados do paciente
  patientName: z.string().optional(),

  // Dados da intenção identificada pela IA
  intent: z.enum(['schedule', 'cancel', 'unknown']).optional(),
  professionalId: z.number().optional(),
  professionalName: z.string().optional(),
  datetime: z.string().optional(),
  reason: z.string().optional(),

  // Resultado da ação executada
  actionSuccess: z.boolean().optional(),
  actionError: z.string().optional(),
  appointmentData: z.any().optional(),

  // Erro geral do processo
  error: z.string().optional(),
});

export type GraphState = z.infer<typeof AppointmentStateAnnotation>;

// Constrói o grafo de agendamento com os nós e fluxos definidos
export function buildAppointmentGraph(llmClient: OpenRouterService, appoinmentService: AppointmentService) {
  // Cria o grafo com o schema de estado definido
  const workflow = new StateGraph({
    stateSchema: AppointmentStateAnnotation,
  })
    // Adiciona os nós de processamento
    .addNode('identifyIntent', createIdentifyIntentNode(llmClient))  // Identifica o que o usuário quer
    .addNode('schedule', createSchedulerNode(appoinmentService))     // Executa agendamento
    .addNode('cancel', createCancellerNode(appoinmentService))       // Executa cancelamento
    .addNode('message', createMessageGeneratorNode(llmClient))       // Gera resposta final

    // Fluxo: começa sempre identificando a intenção
    .addEdge(START, 'identifyIntent')

    // Roteamento condicional baseado na intenção identificada
    .addConditionalEdges(
      'identifyIntent',
      (state: GraphState): string => {
        // Se houve erro ou intenção desconhecida, vai direto para mensagem
        if (state.error || !state.intent || state.intent === 'unknown') {
          return 'message';
        }

        console.log(`Routing based on intent: ${state.intent}`);
        // Roteia para o nó correspondente à intenção
        return state.intent
      },
      {
        schedule: 'schedule',  // Se intent = 'schedule', vai para schedulerNode
        cancel: 'cancel',      // Se intent = 'cancel', vai para cancellerNode
        message: 'message',    // Se desconhecido, vai direto para messageNode
      }
    )

    // Após executar a ação (agendar ou cancelar), sempre vai para gerar mensagem
    .addEdge('schedule', 'message')
    .addEdge('cancel', 'message')

    // Finaliza após gerar a mensagem
    .addEdge('message', END);

  // Compila o grafo para execução
  return workflow.compile();
}
