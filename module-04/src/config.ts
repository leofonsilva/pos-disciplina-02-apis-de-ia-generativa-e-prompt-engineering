export type ModelConfig = {
  apiKey: string;              // Chave de autenticação do OpenRouter
  httpReferer: string;         // Site de origem para identificação
  xTitle: string;              // Nome do projeto

  provider: {
    sort: {
      by: string;              // Critério: 'price' (mais barato) ou 'throughput' (mais rápido)
      partition: string;       // Particionamento dos resultados
    };
  };

  models: string[];            // Lista de modelos disponíveis
  temperature: number;         // Controle de criatividade (0 = preciso, 1 = criativo)

  memory: {
    dbUri: string;             // String de conexão com o banco de dados
  };
  maxMessagesToSummary: number; // Quantas mensagens antes de resumir o histórico
};

// Verifica se a chave da API está configurada nas variáveis de ambiente
console.assert(process.env.OPENROUTER_API_KEY, 'OPENROUTER_API_KEY is not set in environment variables');

export const config: ModelConfig = {
  apiKey: process.env.OPENROUTER_API_KEY!,
  httpReferer: '',              // Opcional - pode ser usado para analytics
  xTitle: 'IA Devs - Prompt Chaining Article Generator',
  
  // Modelos disponíveis (apenas um por enquanto)
  models: [
    'arcee-ai/trinity-large-preview:free',  // Modelo gratuito com suporte a JSON
  ],
  
  provider: {
    sort: {
      by: 'throughput',        // Prioriza o modelo mais rápido
      partition: 'none',       // Sem particionamento
    },
  },
  
  temperature: 0.7,            // Criatividade moderada
  
  memory: {
    dbUri: 'postgresql://postgres:mysecretpassword@localhost:5432/song_recommender',  // Conexão PostgreSQL
  },
  
  maxMessagesToSummary: 2      // Resume quando há 2+ mensagens (ajuste fino)
};
