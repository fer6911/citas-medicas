import whatsappService from './whatsappService.js';

class MessageHandler {
  constructor() {
    this.appointmentState = {};
    this.assistandState = {};
    this.emergencyState = {};
    this.processedMessages = new Set(); // ✅ Para evitar duplicados
  }

  async handleIncomingMessage(message, senderInfo) {
    try {
      // ✅ Verificar si el mensaje ya fue procesado
      const messageKey = `${message.from}_${message.id || message.timestamp}`;
      if (this.processedMessages.has(messageKey)) {
        console.log('Mensaje duplicado, ignorando...');
        return;
      }
      
      // ✅ Agregar a mensajes procesados
      this.processedMessages.add(messageKey);

      const userId = message.from;
      
      if (message?.type === 'text') {
        const incomingMessage = message.text.body.toLowerCase().trim();
      
        // Verificar si es un saludo inicial
        if (this.isGreeting(incomingMessage)) {
          await this.sendWelcomeMessage(userId, message.id, senderInfo);
        }
        // Respuesta por defecto
        else {
          const response = `Digita la información solicitada`;
          await whatsappService.sendMessage(userId, response, message.id);
        }

        await whatsappService.markAsRead(userId, message.id);
      }
    } catch (error) {
      console.error('Error handling message:', error);
    }
  }

  isGreeting(message) {
    const greetings = ["hola", "hello", "hi", "buenas tardes", "buenos días", "buenos dias", "hola!", "buenas"];
    return greetings.includes(message);
  }

  getSenderName(senderInfo) {
    return senderInfo.profile?.name || senderInfo.wa_id || "";
  }

  async sendWelcomeMessage(to, messageId, senderInfo) {
    const name = this.getSenderName(senderInfo);
    const welcomeMessage = `Hola ${name}, Bienvenido a CITAS FACIL Y RAPIDO\n¿En qué puedo ayudarte hoy?`;
    await whatsappService.sendMessage(to, welcomeMessage, messageId);
  }
}

export default new MessageHandler();