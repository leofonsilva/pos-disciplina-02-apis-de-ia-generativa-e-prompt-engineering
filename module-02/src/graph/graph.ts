import { END, MessagesZodMeta, START, StateGraph } from '@langchain/langgraph'
import { withLangGraph } from '@langchain/langgraph/zod'
import { BaseMessage } from 'langchain'
import { z } from 'zod/v3'
import { identifyIntent } from './nodes/identifyIntentNode.ts'
import { chatResponseNode } from './nodes/chatResponseNode.ts'
import { upperCaseNode } from './nodes/upperCaseNode.ts'
import { lowerCaseNode } from './nodes/lowerCaseNode.ts'
import { fallbackNode } from './nodes/fallbackNode.ts'

// Define a estrutura de dados que será passada entre os nós do grafo
const GraphState = z.object({
  messages: withLangGraph(
    z.custom<BaseMessage[]>(),
    MessagesZodMeta
  ),                       // Histórico de mensagens da conversa
  output: z.string(),      // Resposta final gerada
  command: z.enum(['uppercase', 'lowercase', 'unknown'])  // Intenção identificada
})

export type GraphState = z.infer<typeof GraphState>

// Constrói o grafo de processamento com diferentes rotas baseadas na intenção
export function buildGraph() {
  const workflow = new StateGraph({
    stateSchema: GraphState
  })

    // Adiciona os nós de processamento (cada um executa uma função específica)
    .addNode('identifyIntent', identifyIntent)  // Identifica se é comando ou pergunta normal
    .addNode('chatResponse', chatResponseNode)  // Gera resposta com IA

    .addNode('uppercase', upperCaseNode)        // Converte texto para maiúsculas
    .addNode('lowercase', lowerCaseNode)        // Converte texto para minúsculas
    .addNode('fallback', fallbackNode)          // Processa perguntas normais
    
    // Define o fluxo de execução
    .addEdge(START, 'identifyIntent')            // Começa sempre identificando a intenção
    
    // Decide o próximo nó baseado no comando identificado
    .addConditionalEdges(
      'identifyIntent',
      (state: GraphState) => {
        switch (state.command) {
          case 'uppercase':
            return 'uppercase';     // Se for comando de maiúsculas, vai para uppercase
          case 'lowercase':
            return 'lowercase';     // Se for comando de minúsculas, vai para lowercase
          default:
            return 'fallback'       // Senão, vai para fallback (pergunta normal)
        }
      },
      {
        'uppercase': 'uppercase',
        'lowercase': 'lowercase',
        'fallback': 'fallback',
      }
    )
    
    // Depois de processar o comando, todos vão para o chatResponse gerar a resposta final
    .addEdge('uppercase', 'chatResponse')
    .addEdge('lowercase', 'chatResponse')
    .addEdge('fallback', 'chatResponse')

    .addEdge('chatResponse', END)   // Finaliza após gerar a resposta

  // Compila o grafo para execução
  return workflow.compile()
}
