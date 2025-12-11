import whatsappService from './whatsappService.js';
import appointmentMenu from './appointmentMenu/appointmentMenu.js';
import sendEmail from './sendEmail/sendEmail.js';
import createAppointmentService from '../services/createAppointment/createAppointmentService.js';
import userService from './firebaseServices/userService.js'

class MessageHandler {
  constructor() {
    this.processedMessages = new Set();
  }

  async handleIncomingMessage(message, senderInfo) {
    try {
      // Declarar userId primero
      const userId = message.from;

      // Validamos que estamos agendando citas
      if (message.type === "text") {
        const body = message.text.body.trim();

        // Validar si es un número (solo número)
        if (/^\d+$/.test(body)) {
          const handled = await createAppointmentService.processUserSelection(userId, message);
          if (handled) return;
        }
      }

      // Evitar procesar el mismo mensaje 2 veces
      const messageKey = `${userId}_${message.id || message.timestamp}`;
      if (this.processedMessages.has(messageKey)) {
        return;
      }
      this.processedMessages.add(messageKey);

      // Marcar como leído
      await whatsappService.markAsRead(userId, message.id);

      // Procesar según tipo de mensaje
      if (message?.type === 'text') {
        await this.handleTextMessage(userId, message, senderInfo);
      } else if (message?.type === 'interactive') {
        await this.handleInteractiveMessage(userId, message);
      }

    } catch (error) {
      console.error('Error handling message:', error);
    }
  }

  async handleTextMessage(userId, message, senderInfo) {
    const incomingMessage = message.text.body.toLowerCase().trim();

    if (this.isGreeting(incomingMessage)) {
      // Registrar usuario como activo
      sendEmail.registerActiveUser(userId, userId);
      await userService.registerUser(userId, senderInfo.profile?.name);

      await this.sendWelcomeMessage(userId, senderInfo);
      await appointmentMenu.sendWelcomeMenu(userId);
    } else {
      const response = 'Digita una opción válida';
      await whatsappService.sendMessage(userId, response);
    }
  }

  async handleInteractiveMessage(userId, message) {
    const optionId = message.interactive?.button_reply?.id;
    if (optionId) {
      await appointmentMenu.handleMenuResponse(userId, optionId);
    }
  }

  isGreeting(message) {
    const greetings = [
      "hola", "hello", "hi",
      "buenas tardes", "buenos días", "buenos dias",
      "hola!", "buenas noches"
    ];
    return greetings.includes(message);
  }

  getSenderName(senderInfo) {
    return senderInfo.profile?.name || senderInfo.wa_id || "Usuario";
  }

  async sendWelcomeMessage(to, senderInfo) {
    const name = this.getSenderName(senderInfo);
    const welcomeMessage = `Hola ${name},\nBienvenido a CITAS RAPIDÍSIMO\n¿En qué puedo ayudarte hoy?`;
    await whatsappService.sendMessage(to, welcomeMessage);
  }
}

export default new MessageHandler();
