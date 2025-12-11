import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Cargar credenciales
const credentialsPath = path.join(__dirname, '../../credentials/credentials.json');

if (!fs.existsSync(credentialsPath)) {
  console.error('❌ Archivo de credenciales no encontrado:', credentialsPath);
  process.exit(1);
}

const serviceAccount = JSON.parse(fs.readFileSync(credentialsPath, 'utf8'));

// Inicializar Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

class FirebaseService {

  // Obtener citas disponibles
  async getAvailableAppointments() {
    try {
      const snapshot = await db.collection('citas_disponibles')
        .where('estado', '==', true)
        .get();

      const appointments = [];
      snapshot.forEach(doc => {
        appointments.push({ id: doc.id, ...doc.data() });
      });

      return appointments;
    } catch (error) {
      console.error('❌ Error obteniendo citas disponibles:', error);
      return [];
    }
  }

  // Obtener usuario por teléfono
  async getUserByPhone(phone) {
    try {
      const snapshot = await db.collection('usuarios')
        .where('phone', '==', phone)
        .get();

      if (snapshot.empty) return null;

      let user;
      snapshot.forEach(doc => (user = { id: doc.id, ...doc.data() }));

      return user;
    } catch (e) {
      console.error('❌ Error obteniendo usuario:', e);
      return null;
    }
  }

  // Guardar cita agendada
  async saveScheduledAppointment(data) {
    try {
      return await db.collection('citas_agendadas').add(data);
    } catch (e) {
      console.error('❌ Error guardando cita agendada:', e);
      return null;
    }
  }

  //actualizamos el campo esto cita a false despues de guardar un cita medica 
  async updateAppointmentStatus(appointmentId, newStatus) {
    const appointmentRef = admin.firestore()
      .collection('citas_disponibles')
      .doc(appointmentId);

    await appointmentRef.update({
      estado: newStatus
    });
  }
}

export default new FirebaseService();
