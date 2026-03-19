import { AppointmentService } from '../../services/appointmentService.ts';
import type { GraphState } from '../graph.ts';
import { z } from 'zod/v3';

// Define os campos obrigatórios para agendar uma consulta
const ScheduleRequiredFieldsSchema = z.object({
  professionalId: z.number({ required_error: 'Professional ID is required' }),
  datetime: z.string({ required_error: 'Appointment datetime is required' }),
  patientName: z.string({ required_error: 'Patient name is required' }),
});

// Factory que cria um nó para agendar consultas
export function createSchedulerNode(appointmentService: AppointmentService) {
  return async (state: GraphState): Promise<Partial<GraphState>> => {
    console.log(`Scheduling appointment...`);

    try {
      // Valida se todos os campos necessários estão presentes
      const validation = ScheduleRequiredFieldsSchema.safeParse(state)

      // Se faltar algum campo, retorna erro com a lista de campos ausentes
      if (!validation.success) {
        const errorMessages = validation.error.errors.map(e => e.message).join(', ')
        console.log(`Validation failed: ${errorMessages}`);
        return {
          actionSuccess: false,
          actionError: errorMessages,
        }
      }

      // Chama o serviço para agendar a consulta com os dados validados
      const appointment = appointmentService.bookAppointment(
        validation.data.professionalId,
        new Date(validation.data.datetime),
        validation.data.patientName,
        state.reason ?? 'general consultation'  // Motivo da consulta (padrão se não informado)
      )

      // Código comentado para testar erro de horário indisponível
      // const appointment2 = appointmentService.bookAppointment(
      //   validation.data.professionalId,
      //   new Date(validation.data.datetime),
      //   validation.data.patientName,
      //   state.reason ?? 'general consultation'
      // )

      console.log(`Appointment scheduled successfully`);

      // Retorna sucesso com os dados do agendamento
      return {
        ...state,                 // Mantém o estado original
        actionSuccess: true,       // Indica que a ação foi bem-sucedida
        appointmentData: appointment,  // Dados completos da consulta agendada
      };
      
    } catch (error) {
      // Captura qualquer erro durante o processo de agendamento
      console.log(`Scheduling failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return {
        ...state,                 // Mantém o estado original
        actionSuccess: false,      // Indica que a ação falhou
        actionError: error instanceof Error ? error.message : 'Scheduling failed',  // Mensagem de erro
      };
    }
  };
}
