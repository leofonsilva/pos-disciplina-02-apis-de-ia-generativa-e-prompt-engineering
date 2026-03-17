import { config } from "./config.ts";
import { OpenRouterService } from "./openrouterService.ts";
import { createServer } from "./server.ts";

// Inicializa o serviço OpenRouter com as configurações
const routerService = new OpenRouterService(config)

// Cria o servidor HTTP com o serviço de IA
const app = createServer(routerService)

// Inicia o servidor na porta 3000, disponível em todas as interfaces de rede
await app.listen({ port: 3000, host: '0.0.0.0' })
console.log('server running at 3000')

// Passado para os testes
// app.inject({
//     method: 'POST',
//     url: '/chat',
//     body:{ question:'What is rate limiting?'}
// }).then((response) => {
//     console.log('Response status', response.statusCode)
//     console.log('Response body', response.body)
// })
