import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Cargar credenciales
const credentialsPath = path.join(__dirname, '../../credentials/credentials.json');

if (!fs.existsSync(credentialsPath)) {
  console.error('❌ Archivo de credenciales no encontrado en:', credentialsPath);
  console.error('Descárgalo desde Firebase Console → Configuración → Cuentas de servicio');
  process.exit(1);
}

const serviceAccount = JSON.parse(fs.readFileSync(credentialsPath, 'utf8'));

// Inicializar Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

class FirebaseService {
  // Obtener todas las citas DISPONIBLES
  async getAvailableAppointments() {
    try {
      const snapshot = await db.collection('citas_disponibles')
        .where('estado', '==', true)
        .get();
      
      const appointments = [];
      snapshot.forEach(doc => {
        appointments.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      console.log('✅ Citas disponibles obtenidas:', appointments.length);
      return appointments;
    } catch (error) {
      console.error('❌ Error obteniendo citas disponibles:', error.message);
      return [];
    }
  }

  // Obtener citas por especialidad
  async getAppointmentsBySpecialty(specialty) {
    try {
      const snapshot = await db.collection('citas_disponibles')
        .where('estado', '==', true)
        .where('especialidad', '==', specialty)
        .get();
      
      const appointments = [];
      snapshot.forEach(doc => {
        appointments.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      return appointments;
    } catch (error) {
      console.error('Error obteniendo citas por especialidad:', error.message);
      return [];
    }
  }

  // Obtener citas por doctor
  async getAppointmentsByDoctor(doctorName) {
    try {
      const snapshot = await db.collection('citas_disponibles')
        .where('estado', '==', true)
        .where('nombre_doctor', '==', doctorName)
        .get();
      
      const appointments = [];
      snapshot.forEach(doc => {
        appointments.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      return appointments;
    } catch (error) {
      console.error('Error obteniendo citas por doctor:', error.message);
      return [];
    }
  }

  // Obtener citas por fecha
  async getAppointmentsByDate(date) {
    try {
      const snapshot = await db.collection('citas_disponibles')
        .where('estado', '==', true)
        .where('fecha', '==', date)
        .get();
      
      const appointments = [];
      snapshot.forEach(doc => {
        appointments.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      return appointments;
    } catch (error) {
      console.error('Error obteniendo citas por fecha:', error.message);
      return [];
    }
  }

  // Obtener todas las citas AGENDADAS
  async getScheduledAppointments() {
    try {
      const snapshot = await db.collection('citas_agendadas').get();
      
      const appointments = [];
      snapshot.forEach(doc => {
        appointments.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      console.log('✅ Citas agendadas obtenidas:', appointments.length);
      return appointments;
    } catch (error) {
      console.error('❌ Error obteniendo citas agendadas:', error.message);
      return [];
    }
  }

  // Obtener citas agendadas por usuario
  async getScheduledAppointmentsByUser(userId) {
    try {
      const snapshot = await db.collection('citas_agendadas')
        .where('id_usuario', '==', userId)
        .get();
      
      const appointments = [];
      snapshot.forEach(doc => {
        appointments.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      return appointments;
    } catch (error) {
      console.error('Error obteniendo citas por usuario:', error.message);
      return [];
    }
  }
}

export default new FirebaseService();