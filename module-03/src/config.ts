export type ModelConfig = {
  apiKey: string;           // Chave de autenticação do OpenRouter
  httpReferer: string;      // Site de origem para identificação
  xTitle: string;           // Nome do projeto

  provider: {
    sort: {
      by: string;           // Critério de ordenação: 'price' ou 'throughput'
      partition: string;    // Particionamento dos resultados
    };
  };

  models: string[];         // Lista de modelos disponíveis
  temperature: number;      // Controle de criatividade (0 = preciso, 1 = criativo)
};

// Verifica se a chave da API está configurada nas variáveis de ambiente
console.assert(process.env.OPENROUTER_API_KEY, 'OPENROUTER_API_KEY is not set in environment variables');

export const config: ModelConfig = {
  apiKey: process.env.OPENROUTER_API_KEY!,  // Chave vinda das variáveis de ambiente
  httpReferer: '',                           // Site de origem (opcional)
  xTitle: 'IA Devs - Prompt Chaining Article Generator',  // Nome do projeto
  
  // Modelos disponíveis no OpenRouter que suportam response_format
  models: [
    // https://openrouter.ai/models?fmt=cards&max_price=0&supported_parameters=response_format
    'arcee-ai/trinity-large-preview:free',  // Modelo gratuito com suporte a JSON
  ],
  
  provider: {
    sort: {
      by: 'throughput',   // Escolhe o modelo mais rápido disponível
      partition: 'none',   // Sem particionamento (usa todos os provedores)
    },
  },
  
  temperature: 0.7,  // Criatividade moderada (equilíbrio entre precisão e variação)
};
