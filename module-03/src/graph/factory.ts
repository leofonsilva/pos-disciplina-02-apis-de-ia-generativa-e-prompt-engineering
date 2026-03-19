import { config } from '../config.ts';
import { AppointmentService } from '../services/appointmentService.ts';
import { OpenRouterService } from '../services/openRouterService.ts';
import { buildAppointmentGraph } from './graph.ts';

// Constrói o grafo de agendamento com todas as dependências
export function buildGraph() {
  // Cria o cliente OpenRouter para chamadas de IA (identificar intenção, gerar mensagens)
  const llmClient = new OpenRouterService(config)
  
  // Cria o serviço de agendamento para operações no banco de dados
  const appointmentService = new AppointmentService()
  
  // Retorna o grafo configurado com os serviços injetados
  return buildAppointmentGraph(
    llmClient,
    appointmentService,
  );
}

// Exporta uma função assíncrona que cria e retorna o grafo
export const graph = async () => {
  return buildGraph();
};
