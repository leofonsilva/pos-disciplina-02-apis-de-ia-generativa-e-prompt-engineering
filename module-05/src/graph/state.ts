import { z } from 'zod/v3';
import { withLangGraph } from '@langchain/langgraph/zod';
import type { BaseMessage } from '@langchain/core/messages';
import { type User } from '../config.ts';
import type { GuardrailResult } from '../services/openrouterService.ts';
import { MessagesZodMeta } from '@langchain/langgraph';

// Define a estrutura de estado do grafo com sistema de segurança (guardrails)
export const SafeguardStateAnnotation = z.object({
  // Histórico de mensagens da conversa
  messages: withLangGraph(
    z.custom<BaseMessage[]>(),
    MessagesZodMeta),

  // Dados do usuário (papel, permissões, etc.)
  user: z.custom<User>(),

  // Resultado da verificação de segurança (null = ainda não verificou)
  guardrailCheck: z.custom<GuardrailResult | null>().nullable().default(null),

  // Controla se o sistema de segurança está ativo (útil para testes)
  guardrailsEnabled: z.boolean(),
});

export type GraphState = z.infer<typeof SafeguardStateAnnotation>;
