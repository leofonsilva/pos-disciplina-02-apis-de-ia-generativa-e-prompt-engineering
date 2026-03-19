import { createServer } from './server.ts';

// Cria uma instância do servidor Fastify
const app = createServer();

// Inicia o servidor na porta 3000, disponível em todas as interfaces de rede
await app.listen({ port: 3000, host: '0.0.0.0' });
console.log(`Server is running on http://0.0.0.0:3000`);

// Exemplo de comando curl para testar a API
//  curl \
//  -X POST \
//  -H 'Content-type: application/json' \
//  --data '{"question": "upper"}' \
//  localhost:3000/chat