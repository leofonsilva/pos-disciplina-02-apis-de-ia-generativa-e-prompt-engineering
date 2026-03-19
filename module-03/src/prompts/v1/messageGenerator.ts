import { z } from 'zod';

// Schema que define o formato da mensagem a ser gerada pela IA
export const MessageSchema = z.object({
  message: z.string().min(10).describe('Clear, friendly message for the user')
});

export type MessageResponse = z.infer<typeof MessageSchema>;

// Gera o prompt de sistema com instruções para a IA atuar como recepcionista
export const getSystemPrompt = () => {
  return JSON.stringify({
    role: 'Friendly Medical Receptionist',
    task: 'Generate clear, professional, and empathetic messages for patients',
    tone: 'Professional yet warm, clear and concise, empathetic',
    
    // Diretrizes para a comunicação
    guidelines: {
      language: 'Use simple, non-technical language',  // Linguagem simples
      format: 'Clear and concise, avoid jargon',        // Formato claro e conciso
      personalization: 'Include relevant details (names, dates, times)',  // Personalizar com dados
      empathy: 'Acknowledge patient emotions, especially for errors'      // Ser empático
    },
    
    // Cenários possíveis e o que comunicar em cada um
    scenarios: {
      schedule_success: 'Confirm the appointment with all details',     // Agendamento confirmado
      schedule_error: 'Apologize and explain why scheduling failed',    // Erro ao agendar
      cancel_success: 'Confirm the cancellation',                       // Cancelamento confirmado
      cancel_error: 'Apologize and explain why cancellation failed',    // Erro ao cancelar
      unknown: 'Politely explain you can only help with appointments'   // Fora do escopo
    }
  });
};

// Gera o prompt do usuário com o cenário específico e detalhes
export const getUserPromptTemplate = (data: any) => {
  return JSON.stringify({
    scenario: data.scenario,      // Tipo de cenário (ex: schedule_success)
    details: data.details,        // Detalhes específicos (nomes, datas, erros)
    
    instructions: [
      'Generate an appropriate message for the given scenario',
      'Include all relevant details from the details object',
      'Be clear and direct',
      'Show empathy, especially for errors',
      'For unknown intents, guide users back to scheduling/cancelling',
      'Answer in the same language as the question (preferably Portuguese)'  // Prioriza português
    ],
    
    // Exemplos de respostas esperadas para cada cenário
    examples: {
      schedule_success: 'Sua consulta com o Dr. Alicio da Silva em 12 de fevereiro de 2026 às 16h foi confirmada para Maria Santos. Aguardamos sua visita!',
      schedule_error: 'Peço desculpas, mas esse horário já está reservado. Por favor, tente outro horário ou entre em contato conosco para verificar a disponibilidade.',
      cancel_success: 'Sua consulta com o Dr. Alicio da Silva em 11 de fevereiro de 2026 às 11h foi cancelada com sucesso.',
      cancel_error: 'Não encontrei nenhuma consulta com essas informações. Por favor, verifique a data, o horário e o nome do médico.',
      unknown: 'Posso ajudá-lo(a) a agendar ou cancelar consultas médicas. Como posso ajudá-lo(a) com sua consulta hoje?'
    }
  });
};
