import firebaseService from '../../services/firebaseServices/firebaseService.js';
import whatsappService from '../whatsappService.js';
import userService from '../firebaseServices/userService.js';
import appointmentMenu from '../appointmentMenu/appointmentMenu.js';

class CreateAppointmentService {

  constructor() {
    this.userSelections = new Map();
    this.waitingForInfo = new Map();
  }

  async showAvailableAppointments(userId) {
    try {
      const appointments = await firebaseService.getAvailableAppointments();

      if (appointments.length === 0) {
        await whatsappService.sendMessage(userId, 'No hay citas disponibles en este momento.');
        return;
      }

      let message = '📅 *Citas disponibles*\n\n';
      appointments.forEach((apt, index) => {
        message += `${index + 1}. *${apt.nombre_doctor}*\n`;
        message += `   Especialidad: ${apt.especialidad}\n`;
        message += `   Fecha: ${apt.fecha}\n`;
        message += `   Hora: ${apt.hora}\n\n`;
      });

      message += 'Por favor responde con el número de la cita que deseas agendar.';

      this.userSelections.set(userId, appointments);

      await whatsappService.sendMessage(userId, message);
      await whatsappService.sendBackButton(userId);
    } catch (e) {
      console.error('Error mostrando citas:', e);
      await whatsappService.sendMessage(userId, 'Error obteniendo citas. Intenta nuevamente.');
    }
  }

  async processUserSelection(userId, message) {
    if (message?.interactive?.button_reply?.id === "menu_anterior") {
      await appointmentMenu.sendWelcomeMenu(userId);
      return true;
    }

    const appointments = this.userSelections.get(userId);
    if (!appointments) return false;

    const selectedIndex = Number(message.text.body) - 1;
    if (isNaN(selectedIndex) || selectedIndex < 0 || selectedIndex >= appointments.length) {
      await whatsappService.sendMessage(userId, 'Número inválido. Intenta nuevamente.');
      return true;
    }

    const selectedAppointment = appointments[selectedIndex];

    // Guardamos solo la cita seleccionada
    this.waitingForInfo.set(userId, selectedAppointment);

    // Pedimos motivo
    await whatsappService.sendMessage(
      userId,
      "📝 Por favor escribe el *motivo de tu consulta*:"
    );

    return true;  // <-- IMPORTANTE: DETENER EL FLUJO AQUÍ
  }

  async handleConsultationInfo(userId, messageText) {
    const selectedAppointment = this.waitingForInfo.get(userId);
    const userData = await userService.getUser(userId);

    if (!selectedAppointment || !userData) {
      return false;
    }

    // Guardar cita en Firebase con motivo incluido
    await firebaseService.saveScheduledAppointment({
      id_usuario: userId,
      nombre_user: userData.nombre,
      phone: userId,
      nombre_doctor: selectedAppointment.nombre_doctor,
      id_cita: selectedAppointment.id,
      fecha_agendamiento: selectedAppointment.fecha,
      hora: selectedAppointment.hora,
      informacion_consulta: messageText,   // ← NUEVO CAMPO
      estado: true,
      especialidad: selectedAppointment.especialidad,
      creado_en: new Date().toISOString()
    });

    // Cambiar cita a no disponible
    await firebaseService.updateAppointmentStatus(
      selectedAppointment.id,
      false
    );

    // Confirmación al usuario
    await whatsappService.sendMessage(
      userId,
      `✅ Tu cita con *${selectedAppointment.nombre_doctor}* ha sido agendada para el día *${selectedAppointment.fecha}* a las *${selectedAppointment.hora}*.\n📝 *Motivo:* ${messageText}`
    );

    // Limpiar estado
    this.userSelections.delete(userId);
    this.waitingForInfo.delete(userId);

    await whatsappService.sendBackButton(userId);

    return true;
  }
}

export default new CreateAppointmentService();
