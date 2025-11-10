import whatsappService from '../whatsappService.js';
import firebaseService from '../firebaseServices/firebaseService.js';

class AppointmentMenu {
  async sendWelcomeMenu(to) {
    const menuMessage = "Elige una Opción";
    const buttons = [
      {
        type: 'reply',
        reply: { id: 'option_1', title: 'Consultar Citas' }
      },
      {
        type: 'reply',
        reply: { id: 'option_2', title: 'Agendar Cita' }
      },
      {
        type: 'reply',
        reply: { id: 'option_3', title: 'Salir' }
      }
    ];

    await whatsappService.sendInteractiveButtons(to, menuMessage, buttons);
  }

  async handleMenuResponse(userId, optionId) {
    switch(optionId) {
      case 'option_1':
        await this.handleConsultarCitas(userId);
        break;
      case 'option_2':
        await this.handleAgendarCita(userId);
        break;
      case 'option_3':
        await this.handleSalir(userId);
        break;
      default:
        const response = 'Opción no válida';
        await whatsappService.sendMessage(userId, response);
    }
  }

   async handleConsultarCitas(userId) {
    try {
      // Obtener citas disponibles de Firebase
      const appointments = await firebaseService.getAvailableAppointments();
      
      if (appointments.length === 0) {
        const response = 'No hay citas disponibles en este momento. Intenta más tarde.';
        await whatsappService.sendMessage(userId, response);
        return;
      }

      // Formatear mensaje con citas
      let message = '📅 *Citas Disponibles:*\n\n';
      
      appointments.forEach((apt, index) => {
        message += `${index + 1}. ${apt.nombre_doctor}\n`;
        message += `   Especialidad: ${apt.especialidad || 'N/A'}\n`;
        message += `   Fecha: ${apt.fecha}\n`;
        message += `   Hora: ${apt.hora}\n\n`;
      });

      await whatsappService.sendMessage(userId, message);
    } catch (error) {
      console.error('Error consultando citas:', error);
      await whatsappService.sendMessage(userId, 'Error al consultar citas. Intenta de nuevo.');
    }
  }

  async handleAgendarCita(userId) {
    const response = 'Iniciando agendamiento de cita...';
    await whatsappService.sendMessage(userId, response);
    // Aquí irá la lógica para agendar
  }

  async handleSalir(userId) {
    const response = 'Gracias por usar nuestro servicio. ¡Hasta luego!';
    await whatsappService.sendMessage(userId, response);
  }
}

export default new AppointmentMenu();