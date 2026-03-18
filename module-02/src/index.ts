import { createServer } from "./server.ts";

// Cria o servidor HTTP com o serviço de IA
const app = createServer()

// Inicia o servidor na porta 3000, disponível em todas as interfaces de rede
await app.listen({ port: 3000, host: '0.0.0.0' })
console.log('server running at 3000')

// É possível testar os grafos chamando API normalmente
// curl localhost:3000/chat --data '{"question": "uppercase this"}' -H "Content-type: application/json"
