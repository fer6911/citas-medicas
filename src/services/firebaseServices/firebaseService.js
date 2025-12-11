import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const credentialsPath = path.join(__dirname, '../../credentials/credentials.json');

if (!fs.existsSync(credentialsPath)) {
  console.error('❌ Archivo de credenciales no encontrado:', credentialsPath);
  process.exit(1);
}

const serviceAccount = JSON.parse(fs.readFileSync(credentialsPath, 'utf8'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

class FirebaseService {

  async getAvailableAppointments() {
    try {
      const snapshot = await db.collection('citas_disponibles')
        .where('estado', '==', true)
        .get();

      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

    } catch (error) {
      console.error('❌ Error obteniendo citas disponibles:', error);
      return [];
    }
  }

  async getScheduledAppointments() {
    try {
      const snapshot = await db.collection("citas_agendadas").get();

      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

    } catch (error) {
      console.error("❌ Error obteniendo citas agendadas:", error);
      return [];
    }
  }

  async saveScheduledAppointment(data) {
    try {
      return await db.collection('citas_agendadas').add(data);
    } catch (e) {
      console.error('❌ Error guardando cita agendada:', e);
      return null;
    }
  }

  async updateAppointmentStatus(appointmentId, newStatus) {
    try {
      await db.collection('citas_disponibles')
        .doc(appointmentId)
        .update({ estado: newStatus });
    } catch (e) {
      console.error("❌ Error actualizando estado:", e);
    }
  }
}

export default new FirebaseService();
