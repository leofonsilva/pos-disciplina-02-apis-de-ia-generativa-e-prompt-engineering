import test from 'node:test'
import assert from 'node:assert/strict'
import { createServer } from '../src/server.ts'
import { config } from '../src/config.ts'
import { type LLMResponse, OpenRouterService } from '../src/openrouterService.ts'

// Verifica se a chave da API está configurada antes de executar os testes
console.assert(
  process.env.OPENROUTER_API_KEY,
  'OPENROUTER_API_KEY is not set in env variables'
)

// Testa se o sistema escolhe o modelo mais barato quando configurado para isso
test('routes to cheapest model by default', async () => {
  // Cria uma configuração personalizada que prioriza o menor preço
  const customConfig = {
    ...config,
    provider: {
      ...config.provider,
      sort: {
        ...config.provider.sort,
        by: 'price'  // Ordena modelos por preço (mais barato primeiro)
      }
    }
  }
  
  const routerService = new OpenRouterService(customConfig)
  const app = createServer(routerService)

  // Simula uma requisição POST para o servidor
  const response = await app.inject({
    method: 'POST',
    url: '/chat',
    body: { question: 'What is rate limiting?' }
  })
  
  // Verifica se a requisição foi bem-sucedida
  assert.equal(response.statusCode, 200)
  const body = response.json() as LLMResponse

  // Verifica se o modelo escolhido foi o mais barato disponível
  assert.equal(body.model, 'arcee-ai/trinity-large-preview:free')
})

// Testa se o sistema escolhe o modelo mais rápido quando configurado para isso
test('routes to highest throughput model by default', async () => {
  // Cria uma configuração personalizada que prioriza a velocidade de processamento
  const customConfig = {
    ...config,
    provider: {
      ...config.provider,
      sort: {
        ...config.provider.sort,
        by: 'throughput'  // Ordena modelos por velocidade (mais rápido primeiro)
      }
    }
  }
  
  const routerService = new OpenRouterService(customConfig)
  const app = createServer(routerService)

  // Simula uma requisição POST para o servidor
  const response = await app.inject({
    method: 'POST',
    url: '/chat',
    body: { question: 'What is rate limiting?' }
  })
  
  // Verifica se a requisição foi bem-sucedida
  assert.equal(response.statusCode, 200)
  const body = response.json() as LLMResponse

  // Verifica se o modelo escolhido foi o mais rápido disponível
  assert.equal(body.model, 'nvidia/nemotron-3-nano-30b-a3b:free')
})
