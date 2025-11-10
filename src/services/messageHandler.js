import whatsappService from './whatsappService.js';
import appointmentMenu from './appointmentMenu/appointmentMenu.js';

class MessageHandler {
  constructor() {
    this.processedMessages = new Set();
  }

  async handleIncomingMessage(message, senderInfo) {
    try {
      const messageKey = `${message.from}_${message.id || message.timestamp}`;
      if (this.processedMessages.has(messageKey)) {
        return;
      }
      this.processedMessages.add(messageKey);

      const userId = message.from;

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
      await this.sendWelcomeMessage(userId, senderInfo);
      // Mostrar menú después del saludo
      await appointmentMenu.sendWelcomeMenu(userId);
    } else {
      const response = 'Digita una opción válida';
      await whatsappService.sendMessage(userId, response);
    }
  }

  async handleInteractiveMessage(userId, message) {
    // Cuando el usuario presiona un botón
    const optionId = message.interactive?.button_reply?.id;
    if (optionId) {
      await appointmentMenu.handleMenuResponse(userId, optionId);
    }
  }

  isGreeting(message) {
    const greetings = ["hola", "hello", "hi", "buenas tardes",
      "buenos días", "buenos dias", "hola!", "buenas noches"
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