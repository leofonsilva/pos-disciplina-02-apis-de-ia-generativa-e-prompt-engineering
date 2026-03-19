import { AppointmentService } from '../../services/appointmentService.ts';
import type { GraphState } from '../graph.ts';
import { z } from 'zod/v3';

// Define os campos obrigatórios para cancelar um agendamento
const CancelRequiredFieldsSchema = z.object({
  professionalId: z.number({ required_error: 'Professional ID is required' }),
  datetime: z.string({ required_error: 'Appointment datetime is required' }),
  patientName: z.string({ required_error: 'Patient name is required' }),
});

// Factory que cria um nó para cancelar agendamentos
export function createCancellerNode(appointmentService: AppointmentService) {
  return async (state: GraphState): Promise<Partial<GraphState>> => {

    try {
      console.log(`Cancelling appointment...`);

      // Valida se todos os campos necessários estão presentes
      const validation = CancelRequiredFieldsSchema.safeParse(state)
      
      // Se faltar algum campo, retorna erro com a lista de campos ausentes
      if (validation.error) {
        const errorMessages = validation.error.errors.map(e => e.message).join(', ')
        console.log(`Validation failed: ${errorMessages}`);
        return {
          actionSuccess: false,
          actionError: errorMessages,
        }
      }

      // Chama o serviço para cancelar o agendamento com os dados validados
      appointmentService.cancelAppointment(
        validation.data.professionalId,
        validation.data.patientName,
        new Date(validation.data.datetime)
      )

      return {
        actionSuccess: true,  // Indica que o cancelamento foi bem-sucedido
      };
      
    } catch (error) {
      // Captura qualquer erro durante o processo de cancelamento
      console.log(`Cancellation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return {
        actionSuccess: false,
        actionError: error instanceof Error ? error.message : 'Cancellation failed',
      };
    }
  };
}
