// Configuração de datas para exemplos iniciais
const today = new Date();
const todayAtElevenAM = new Date(today);
todayAtElevenAM.setUTCHours(11, 0, 0, 0);  // Hoje às 11:00 UTC

const tomorrow = new Date();
tomorrow.setDate(today.getDate() + 1);
const tomorrowAtTwoPM = new Date(tomorrow);
tomorrowAtTwoPM.setUTCHours(14, 0, 0, 0);  // Amanhã às 14:00 UTC

// Lista de profissionais disponíveis na clínica
export const professionals = [
  {
    id: 1,
    name: 'Dr. Alicio da Silva',
    specialty: 'Cardiologia',
  },
  {
    id: 2,
    name: 'Dra. Ana Pereira',
    specialty: 'Dermatologia',
  },
  {
    id: 3,
    name: 'Dra. Carol Gomes',
    specialty: 'Neurologia',
  },
];

// Agendamentos iniciais para teste (já existentes no sistema)
const appointments = [
  {
    date: todayAtElevenAM.toISOString(),
    patientName: 'Joao da Silva',
    reason: 'check-up regular',
    professionalId: professionals[0].id
  },
  {
    date: tomorrowAtTwoPM.toISOString(),
    patientName: 'Luana Costa',
    reason: 'Erupção cutânea',
    professionalId: professionals[1].id
  },
];

// Serviço responsável por gerenciar agendamentos
export class AppointmentService {

  // Busca um agendamento específico por profissional, data e (opcional) paciente
  getAppointmentsForProfessional(professionalId: number, date: Date, patientName?: string) {
    return appointments.find(appointment =>
      appointment.professionalId === professionalId &&
      new Date(appointment.date).getTime() === date.getTime() &&
      (!patientName || appointment.patientName === patientName)
    );
  }

  // Verifica se um horário está disponível para um profissional
  checkAvailability(professionalId: number, date: Date): boolean {
    const alreadyBooked = this.getAppointmentsForProfessional(professionalId, date);
    return !alreadyBooked; // Retorna true se disponível, false se já agendado
  }

  // Agenda uma nova consulta se o horário estiver disponível
  bookAppointment(professionalId: number, date: Date, patientName: string, reason: string) {
    // Verifica disponibilidade antes de agendar
    if (!this.checkAvailability(professionalId, date)) {
      throw new Error('Horário indisponível para este profissional');
    }

    // Cria e adiciona o novo agendamento
    const newAppointment = {
      date: date.toISOString(),
      patientName,
      reason,
      professionalId
    };

    appointments.push(newAppointment);
    return newAppointment;
  }

  // Cancela uma consulta existente
  cancelAppointment(professionalId: number, patientName: string, date: Date) {
    // Verifica se o agendamento existe antes de cancelar
    const hasBooked = this.getAppointmentsForProfessional(professionalId, date, patientName);
    if (!hasBooked) {
      throw new Error('Agendamento não encontrado para cancelamento');
    }

    // Remove o agendamento da lista
    const index = appointments.indexOf(hasBooked);
    appointments.splice(index, 1);
  }
}
