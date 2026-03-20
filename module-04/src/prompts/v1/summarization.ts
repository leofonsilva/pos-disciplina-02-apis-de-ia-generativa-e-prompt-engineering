import { z } from 'zod/v3';

// Schema para o resumo da conversa sobre preferências musicais
export const SummarySchema = z.object({
  name: z.string().optional().describe('Nome do usuário'),
  age: z.number().optional().describe('Idade do usuário'),
  favoriteGenres: z.array(z.string()).optional().describe('Gêneros musicais favoritos mencionados'),
  favoriteBands: z.array(z.string()).optional().describe('Bandas ou artistas favoritos mencionados'),
  keyPreferences: z.string().describe('Sumário conciso das preferências musicais, padrões de humor e hábitos'),
  importantContext: z.string().optional().describe('Qualquer outro contexto importante sobre o usuário'),
});

export type ConversationSummary = z.infer<typeof SummarySchema>;

// Gera o prompt de sistema para a IA sumarizar a conversa
export const getSummarizationSystemPrompt = () => {
  return JSON.stringify({
    role: 'Sumarizador de conversação para preferências musicais',

    tarefa: 'Analisar conversa e extrair preferências musicais estruturadas',

    // Campos que devem ser extraídos do resumo
    campos_para_extrair: {
      name: 'Nome do usuário',
      age: 'Idade do usuário',
      favoriteGenres: 'Todos os gêneros mencionados',
      favoriteBands: 'Todas as bandas/artistas mencionados',
      keyPreferences: 'Sumário de 2-4 frases sobre gostos, padrões de humor e contexto de escuta',
      importantContext: 'Outros detalhes relevantes'
    },

    // Regras para criar um resumo consistente
    regras: [
      'Combinar informações duplicadas',                                      // Evita repetições
      'Ser específico sobre gêneros e artistas',                              // Ex: "rock", não apenas "música"
      'Incluir associações de humor (ex: "gosta de rock animado ao fazer exercícios")', // Contexto emocional
      'Se atualizando sumário anterior, preservar info não discutida na nova conversa', // Mantém continuidade
      'Incluir apenas informações explicitamente declaradas'                  // Não inventa dados
    ]
  });
};

// Gera o prompt do usuário com a conversa e o resumo anterior
export const getSummarizationUserPrompt = (
  conversationHistory: Array<{ role: string; content: string }>,
  previousSummary?: ConversationSummary
) => {
  return JSON.stringify({
    // Converte o histórico para um formato legível
    conversa: conversationHistory.map(msg => `${msg.role}: ${msg.content}`).join('\n'),

    // Resumo anterior (se existir) para manter continuidade
    sumario_anterior: previousSummary || 'Nenhum',

    instrucoes: [
      'Atualizar sumário com novas informações desta conversa',
      'Preservar info existente não discutida nas novas mensagens'
    ]
  });
};
