import { createServer } from './server.ts';

// Cria uma instância do servidor Fastify
const app = createServer();

// Inicia o servidor na porta 4000, disponível em todas as interfaces de rede
await app.listen({ port: 4000, host: '0.0.0.0' });
console.log(`Server is running on http://0.0.0.0:4000`);

// Exemplo de comando curl para testar a API via linha de comando
//  curl \
//  -X POST \
//  -H 'Content-type: application/json' \
//  --data '{"question": "upper"}' \
//  localhost:4000/chat

// Teste automatizado: faz uma requisição POST para a rota /sales
app.inject({
  method: 'POST',
  url: '/sales',
  payload: {
    // Pergunta de exemplo - descomente a que deseja testar
    // question: 'Which courses are commonly bought together?', // complex - recomendação de cursos
    question: "Find courses that students typically purchase after 'Machine Learning em Navegadores'", // complex - sequência de compras
    // question: 'Show me the revenue distribution across all courses', // análise de receita
    // question: 'Which users have progressed over 80%?', // alunos com alto progresso
    // question: 'Quantos cursos tem na academia?', // simple - contagem simples
  },
}).then(response => {
  // Exibe apenas a resposta da IA (campo answer)
  console.log(JSON.parse(response.body)?.answer);
}).catch(error => {
  console.error('Error making test request:', error);
})
