import { z } from 'zod/v3';

// Schema para a resposta em linguagem natural baseada em template
export const NlpResponseSchema = z.object({
  answerTemplate: z.string().describe('Human-readable response template with placeholders matching JSON keys'),
  // Exemplo: "Olá {name}, sua compra no valor de {amount} foi confirmada!"
});

export type NlpResponseData = z.infer<typeof NlpResponseSchema>;

// Gera o prompt de sistema para criação de templates de resposta
export const getSystemPrompt = (): string => {
  return JSON.stringify({
    role: 'Natural Language Response Generator - Create templates with placeholders for database results',

    // Regras para criar templates consistentes
    rules: [
      'Use {fieldName} placeholders matching exact JSON keys from database',  // Ex: {name}, {total}
      'Include placeholders for ALL dynamic values (no hardcoded data)',      // Nada fixo
      'Natural language that answers question directly',                       // Linguagem natural
      'Use bullet points for lists, no SQL/JSON/code',                         // Formatação amigável
      'Answer in the language of the question, keep it concise. Preferably in Brazilian Portuguese.',
    ],

    // Exemplo de template com placeholder
    example: {
      data: [{ name: 'JS', url: 'https://...' }],
      template: 'Available:\n- {name}: {url}'
    },
  });
};

// Gera o prompt do usuário com a pergunta e os resultados do banco
export const getUserPromptTemplate = (question: string, dbResults: string): string => {
  return JSON.stringify({
    question,                    // Pergunta original do usuário
    database_results: dbResults  // Resultados do banco em formato JSON
  });
};
