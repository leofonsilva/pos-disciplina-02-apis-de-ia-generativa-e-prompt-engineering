import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from '../src/server.ts';
import { professionals } from '../src/services/appointmentService.ts';

// Cria o servidor uma única vez para todos os testes
const app = createServer();

// Função auxiliar para fazer requisições ao servidor
async function makeARequest(question: string) {
  return await app.inject({
    method: 'POST',
    url: '/chat',
    payload: {
      question,
    },
  });
}

// Testes end-to-end do sistema de agendamento médico
describe('Medical Appointment System - E2E Tests', async () => {

  // TESTE 1: Agendamento bem-sucedido
  // Obs: .skip significa que este teste está temporariamente desativado
  it.skip('Schedule appointment - Success', async () => {
    const response = await makeARequest(
      `Olá, sou Maria Santos e quero agendar uma consulta com ${professionals.at(0)?.name} para amanhã às 16h para um check-up regular`
    )

    console.log('Schedule Success Response:', response.body);

    // Verifica se a requisição foi bem-sucedida
    assert.equal(response.statusCode, 200);
    const body = JSON.parse(response.body);
    
    // Confirma que a intenção foi identificada como 'schedule' e a ação foi bem-sucedida
    assert.equal(body.intent, 'schedule');
    assert.equal(body.actionSuccess, true);
  });

  // TESTE 2: Cancelamento bem-sucedido
  it('Cancel appointment - Success', async () => {
    // Primeiro agenda uma consulta para depois cancelar
    await makeARequest(
      `Sou Joao da Silva e quero agendar uma consulta com ${professionals.at(1)?.name} para hoje às 14h`
    )

    // Requisição de cancelamento
    const response = await makeARequest(
      `Cancele minha consulta com ${professionals.at(1)?.name} que tenho hoje às 14h, me chamo Joao da Silva`
    );

    console.log('Cancel Success Response:', response.body);

    // Verifica se a requisição foi bem-sucedida
    assert.equal(response.statusCode, 200);
    const body = JSON.parse(response.body);
    
    // Confirma que a intenção foi identificada como 'cancel' e a ação foi bem-sucedida
    assert.equal(body.intent, 'cancel');
    assert.equal(body.actionSuccess, true);
  });
});
