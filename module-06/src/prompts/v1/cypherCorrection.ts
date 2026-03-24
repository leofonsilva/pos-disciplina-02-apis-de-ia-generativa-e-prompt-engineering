import { z } from 'zod/v3';

// Schema para a correção de queries Cypher
export const CypherCorrectionSchema = z.object({
  correctedQuery: z.string().describe('The corrected Neo4j Cypher query'),   // Query corrigida
  explanation: z.string().describe('Brief explanation of what was fixed'),   // Explicação da correção
});

export type CypherCorrectionData = z.infer<typeof CypherCorrectionSchema>;

// Gera o prompt de sistema para correção de queries Cypher
export const getSystemPrompt = (schema: string): string => {
  return JSON.stringify({
    role: 'Neo4j Cypher Query Debugger - Fix invalid queries based on error messages',
    schema,  // Esquema do banco (labels, relacionamentos, propriedades)

    // Regras para corrigir erros comuns
    rules: [
      'Read error carefully, preserve original intent, return valid executable query',
      'Aggregation errors: Use WITH to separate grouping from aggregation',         // Ex: SUM, AVG
      'Variable scope errors: Pass variables through WITH or redefine them',        // Variáveis não definidas
      'NULL errors: Add NULLS LAST/FIRST to ORDER BY',                              // Ordenação com nulos
      'Property errors: Check schema, use correct aliases (n.name AS name)',        // Propriedades inexistentes
    ],

    // Exemplo de correção
    example: {
      failed: 'WITH SUM(p.amount) AS total ... RETURN c.name, revenue, round(revenue / total, 2)',
      error: 'Implicit grouping expressions: totalRevenue',
      corrected: 'WITH SUM(p.amount) AS total ... WITH total, c.name AS name, SUM(p2.amount) AS rev RETURN name, rev, round(rev / total, 2)',
      fix: 'Moved grouping into WITH before RETURN',
    },
  });
};

// Gera o prompt do usuário com a query que falhou e a mensagem de erro
export const getUserPromptTemplate = (
  failedQuery: string,
  errorMessage: string,
  originalQuestion?: string
): string => {
  return JSON.stringify({
    failed_query: failedQuery,           // Query que gerou erro
    error_message: errorMessage,         // Mensagem de erro do Neo4j
    original_question: originalQuestion, // Pergunta original (contexto adicional)
  });
};
