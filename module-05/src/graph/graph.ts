import { StateGraph, START, END } from '@langchain/langgraph';
import { SafeguardStateAnnotation, type GraphState } from './state.ts';
import { createGuardrailsCheckNode } from './nodes/guardrailsCheckNode.ts';
import { createChatNode } from './nodes/chatNode.ts';
import { blockedNode } from './nodes/blockedNode.ts';
import { routeAfterGuardrails } from './nodes/edgeConditions.ts';
import { OpenRouterService } from '../services/openrouterService.ts';

// Constrói o grafo de chat com sistema de segurança (guardrails)
export function buildChatGraph() {
  // Cria o cliente OpenRouter para chamadas à IA
  const service = new OpenRouterService();

  // Cria o grafo com o schema de estado que inclui campos de segurança
  const workflow = new StateGraph({
    stateSchema: SafeguardStateAnnotation
  })
    // Adiciona os nós do grafo
    .addNode('guardrails_check', createGuardrailsCheckNode(service))  // Verifica segurança da mensagem
    .addNode('chat', createChatNode(service))                         // Gera resposta da IA
    .addNode('blocked', blockedNode)                                  // Retorna mensagem de bloqueio

    // Ponto de entrada: sempre começa verificando a segurança
    .addEdge(START, 'guardrails_check')

    // Roteamento condicional após a verificação de segurança
    .addConditionalEdges(
      'guardrails_check',
      (state: GraphState) => routeAfterGuardrails(state),  // Decide para onde ir
      {
        chat: 'chat',       // Se segura → vai para chat
        blocked: 'blocked', // Se insegura → vai para blocked
      }
    )

    // Ambos os nós finais encerram o fluxo
    .addEdge('chat', END)     // Após resposta, finaliza
    .addEdge('blocked', END); // Após bloqueio, finaliza

  // Compila e retorna o grafo pronto para execução
  return workflow.compile();
}