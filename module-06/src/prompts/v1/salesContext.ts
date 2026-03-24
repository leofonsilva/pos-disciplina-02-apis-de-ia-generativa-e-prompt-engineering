// Contexto de negócios para o sistema de análise de vendas
// Este texto é usado nos prompts para guiar a IA na geração de queries Cypher
export const SALES_CONTEXT = `
## Business Rules - Online Academy Sales Analytics

- Students can only have progress in courses they purchased (status="paid")
- One purchase and one progress record per student-course pair
- Always use \`status = "paid"\` to filter active purchases in revenue queries
- Refunded purchases (status="refunded") should be excluded from revenue calculations
- Progress values range from 0-100 (percentage completed)
`;
