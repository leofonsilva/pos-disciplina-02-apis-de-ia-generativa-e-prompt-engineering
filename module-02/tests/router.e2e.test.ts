import test from 'node:test'
import assert from 'node:assert/strict'
import { createServer } from '../src/server.ts'

// Testa se o comando "upper" converte a mensagem para MAIÚSCULAS
test('command upper transforms message into UPPERCASE', async () => {
  const app = createServer()
  const msg = 'make THis message UPPER please!'
  const expected = msg.toUpperCase()  // Deve retornar tudo em maiúsculas
  
  const response = await app.inject({
    method: 'POST',
    url: '/chat',
    body: { question: msg }
  })
  
  assert.equal(response.statusCode, 200)
  assert.equal(response.body, expected)
})

// Testa se o comando "lower" converte a mensagem para minúsculas
test('command upper transforms message into LOWERCASE', async () => {
  const app = createServer()
  const msg = 'MAKE THIS MESSAGE LOWER PLEASE!'
  const expected = msg.toLowerCase()  // Deve retornar tudo em minúsculas
  
  const response = await app.inject({
    method: 'POST',
    url: '/chat',
    body: { question: msg }
  })
  
  assert.equal(response.statusCode, 200)
  assert.equal(response.body, expected)
})

// Testa se mensagens sem comando recebem a resposta padrão de ajuda
test('command upper transforms message into UNKNOWN', async () => {
  const app = createServer()
  const msg = 'HEY THERE!'
  const expected = "Unknown command. Try 'make this uppercase' or 'convert to lowercase'"
  
  const response = await app.inject({
    method: 'POST',
    url: '/chat',
    body: { question: msg }
  })
  
  assert.equal(response.statusCode, 200)
  assert.equal(response.body, expected)
})
