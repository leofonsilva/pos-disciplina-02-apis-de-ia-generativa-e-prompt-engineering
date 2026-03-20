import { PostgresSaver } from "@langchain/langgraph-checkpoint-postgres"
import { PostgresStore } from "@langchain/langgraph-checkpoint-postgres/store"
import { config } from "../config.ts"

// Interface que define os componentes de memória para o LangGraph
export type MemoryService = {
  checkpointer: PostgresSaver  // Salva o estado do grafo (checkpoints) para retomar conversas
  store: PostgresStore         // Armazena dados de longo prazo (preferências, resumos)
}

// Cria e configura os serviços de memória usando PostgreSQL
export async function createMemoryService(): Promise<MemoryService> {
  const dbUri = config.memory.dbUri  // String de conexão com o banco de dados

  // Cria os componentes de memória conectados ao PostgreSQL
  const store = PostgresStore.fromConnString(dbUri)        // Para dados persistentes
  const checkpointer = PostgresSaver.fromConnString(dbUri) // Para checkpoints de estado

  // Inicializa as tabelas no banco de dados
  await store.setup()        // Cria tabelas para armazenamento de longo prazo
  await checkpointer.setup() // Cria tabelas para checkpoints

  console.log(`Memória configurada: PostgreSQL`);

  return {
    checkpointer,
    store,
  }
}
