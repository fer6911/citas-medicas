import sendToWhatsApp from './httpRequest/sendToWhatsApp.js';

class WhatsAppService {
  async sendMessage(to, body, messageId) {
    const data = {
      messaging_product: 'whatsapp',
      to,
      text: { body }
    };
    return await sendToWhatsApp(data);
  }

  async markAsRead(to, messageId) {
    const data = {
      messaging_product: 'whatsapp',
      status: 'read',
      message_id: messageId,
    };
    return await sendToWhatsApp(data);
  }
}

export default new WhatsAppService();