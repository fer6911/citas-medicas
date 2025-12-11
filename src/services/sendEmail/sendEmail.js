import firebaseService from '../firebaseServices/firebaseService.js';
import whatsappService from '../whatsappService.js';

class SendEmail {
  constructor() {
    this.pollingInterval = null;
    this.activeUsers = new Map(); // Guardar {userId: phone}
  }

  // Registrar usuario activo
  registerActiveUser(userId, phone) {
    this.activeUsers.set(userId, phone);
    console.log(`👤 Usuario registrado: ${userId} - ${phone}`);
  }

  // Remover usuario
  removeActiveUser(userId) {
    this.activeUsers.delete(userId);
    console.log(`👤 Usuario removido: ${userId}`);
  }

  // ✅ Cargar teléfonos desde citas_agendadas
  async loadPhonesFromAppointments() {
    try {
      console.log('📲 Cargando números de teléfono de citas agendadas...');
      
      const appointments = await firebaseService.getScheduledAppointments();
      
      if (appointments.length === 0) {
        console.log('⚠️ No hay citas agendadas');
        return;
      }

      // Limpiar usuarios anteriores
      this.activeUsers.clear();

      // Registrar cada usuario único con su teléfono
      appointments.forEach(apt => {
        if (apt.phone && apt.id_usuario) {
          // Usar id_usuario como clave para que sea único por usuario
          this.registerActiveUser(apt.id_usuario, apt.phone);
        }
      });

      console.log(`✅ ${this.activeUsers.size} usuario(s) cargado(s)`);
    } catch (error) {
      console.error('❌ Error cargando teléfonos:', error);
    }
  }

  // Iniciar polling cada 15 segundos
  startPolling() {
    console.log('🚀 Iniciando polling de citas disponibles cada 15 segundos...');
    
    // ✅ Cargar teléfonos inicialmente
    this.loadPhonesFromAppointments();
    
    // ✅ Iniciar el intervalo
    this.pollingInterval = setInterval(async () => {
      await this.sendAppointmentsToAllUsers();
    }, 15000); // 15 segundos
  }

  // Detener polling
  stopPolling() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      console.log('⛔ Polling detenido');
    }
  }

  // Enviar citas a cada usuario (solo sus citas)
  async sendAppointmentsToAllUsers() {
    try {
      // Obtener TODAS las citas agendadas
      const allAppointments = await firebaseService.getScheduledAppointments();
    
      if (this.activeUsers.size > 0) {
        // Para cada usuario registrado
        for (const [userId, phone] of this.activeUsers.entries()) {
          // Filtrar solo las citas de este usuario
          const userAppointments = allAppointments.filter(apt => apt.id_usuario === userId);
          
          // Enviar solo si tiene citas
          if (userAppointments.length > 0) {
            await this.sendAppointmentsToUser(phone, userAppointments);
          }
        }
        console.log(`✅ TABLA CONSULTADA Y MENSAJES ENVIADOS A ${this.activeUsers.size} USUARIO(S)`);
      } else {
        console.log('ℹ️ No hay usuarios activos para enviar mensajes');
      }
    } catch (error) {
      console.error('❌ Error enviando citas:', error);
    }
  }

  // Enviar citas a un usuario específico
  async sendAppointmentsToUser(phone, appointments) {
    try {
      let message = '📅 *Tus Citas Agendadas:*\n\n';
      
      if (appointments.length === 0) {
        message += 'No hay citas agendadas en este momento.\n';
      } else {
        appointments.forEach((apt, index) => {
          message += `${index + 1}. ${apt.nombre_user || 'N/A'}\n`;
          message += `   Nombre del doctor: ${apt.nombre_doctor || 'N/A'}\n`;
          message += `   Especialidad: ${apt.especialidad || 'N/A'}\n`;
          message += `   Fecha Cita: ${apt.fecha_agendamiento || 'N/A'}\n`;
          message += `   Hora: ${apt.hora || 'N/A'}\n\n`;
          message += `   📝Motivo de tu consulta:\n   ${apt.informacion_consulta || 'N/A'}`;
        });
      }

      await whatsappService.sendMessage(phone, message);
      console.log(`✉️ Citas enviadas a: ${phone}`);
    } catch (error) {
      console.error(`❌ Error enviando a ${phone}:`, error);
    }
  }
}

export default new SendEmail();