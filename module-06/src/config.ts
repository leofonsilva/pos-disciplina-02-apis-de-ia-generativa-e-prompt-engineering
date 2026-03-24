export const config = {
  apiKey: process.env.OPENROUTER_API_KEY!,
  httpReferer: '',
  xTitle: 'IA Devs - Sales Analytics Reporter',
  models: [
    'arcee-ai/trinity-large-preview:free', // Instável
    // 'mistralai/mistral-nemo', // Pago, porém bem simplório
    // 'google/gemma-3n-e4b-it', // Pago, bem simplório mas cumpriu tarefa
    // 'openai/gpt-4o-mini' // Pago
  ],
  provider: {
    sort: {
      by: 'throughput', // Route to model with highest throughput (fastest response)
      partition: 'none',
    },
  },
  temperature: 0.7,
  neo4j: {
    uri: "neo4j://localhost:7687",
    username: "neo4j",
    password: "password",
  },
  maxCorrectionAttempts: 1,
  maxSubQuestions: 3,
};


export default config
