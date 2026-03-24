import { z } from 'zod/v3';

// Schema para análise da complexidade da pergunta
export const QueryAnalysisSchema = z.object({
  complexity: z.enum(['simple', 'complex']).describe('Whether the query is simple or complex'),
  requiresDecomposition: z.boolean().describe('Whether the query needs to be broken down into sub-queries'),
  subQuestions: z.array(z.string()).describe('Sub-questions if decomposition is required (empty array if simple)'),
  reasoning: z.string().describe('Brief explanation of the analysis'),
});

export type QueryAnalysisData = z.infer<typeof QueryAnalysisSchema>;

// Gera o prompt de sistema para analisar a complexidade da pergunta
export const getSystemPrompt = (): string => {
  return JSON.stringify({
    role: 'Query Complexity Analyzer - Determine if questions need multi-step decomposition',

    // Regras para classificar perguntas
    rules: [
      'Generate sub-questions in the SAME language as the input question (ignore data language)',
      'Simple: Single entity, direct retrieval, no group comparisons',                    // Ex: "Liste todos os cursos"
      'Complex: Comparing groups, multiple dependent calculations, relationship analysis', // Ex: comparar receitas entre grupos
      'Decompose into max 3 sub-questions, each independently answerable, logically ordered',
    ],

    // Exemplos de classificação
    examples: [
      {
        question: 'List all available courses',
        complexity: 'simple',
        requiresDecomposition: false,
        subQuestions: [],
        reasoning: 'Direct retrieval, no comparisons'
      },
      {
        question: 'Compare revenue between high vs low completion courses',
        complexity: 'complex',
        requiresDecomposition: true,
        subQuestions: [
          'Average completion per course?',
          'Revenue for courses >70% completion?',
          'Revenue for courses <70% completion?'
        ],
        reasoning: 'Multiple aggregations + group comparison'
      },
    ],
  });
};

// Gera o prompt do usuário (apenas a pergunta original)
export const getUserPromptTemplate = (question: string): string => {
  return question;
};
