// Verifica se a chave da API OpenRouter está configurada nas variáveis de ambiente
console.assert(
  process.env.OPENROUTER_API_KEY,
  'OPENROUTER_API_KEY is not set in env variables'
)

// Configurações para o modelo de IA e provedor OpenRouter
export type ModelConfig = {
  apiKey: string;         // Chave de autenticação da API
  httpReferer: string;    // Site de origem para identificação
  xTitle: string;         // Nome do projeto
  port: number;           // Porta onde o servidor vai rodar
  models: string[];       // Lista de modelos disponíveis
  temperature: number;    // Controle de criatividade (0 = preciso, 1 = criativo)
  maxTokens: number;      // Limite de tamanho da resposta
  systemPrompt: string;   // Instrução de comportamento para a IA

  provider: {
    sort: {
      by: string,         // Critério de ordenação: 'price', 'throughput' ou 'latency'
      partition: string,  // Particionamento dos resultados
    }
  }
}

export const config: ModelConfig = {
  apiKey: process.env.OPENROUTER_API_KEY!,  // Chave vinda das variáveis de ambiente
  httpReferer: 'http://pos-ia.com',
  xTitle: 'SmartModelRouterGateway',
  port: 3000,
  models: [
    // Modelos gratuitos disponíveis no OpenRouter
    'arcee-ai/trinity-large-preview:free',    // Melhor para ordenação por preço
    'nvidia/nemotron-3-nano-30b-a3b:free'     // Melhor para ordenação por throughput
  ],
  temperature: 0.2,        // Baixa criatividade (respostas mais precisas)
  maxTokens: 100,          // Respostas curtas (aproximadamente 75 palavras)
  systemPrompt: 'You are a helpful assistant.',  // Papel da IA
  provider: {
    sort: {
      // Escolha qual critério usar para selecionar o modelo:
      by: 'latency',        // Pode ser: 'price', 'throughput' ou 'latency'
      // by: 'throughput',  // Modelo mais rápido
      // by: 'price',       // Modelo mais barato
      partition: 'none'     // Sem particionamento (usa todos os provedores)
    }
  }
}