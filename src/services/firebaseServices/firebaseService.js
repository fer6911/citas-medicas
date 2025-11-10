import { initializeApp } from 'firebase/app';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';

// Configurar Firebase (usa tus credenciales)
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
  measurementId: process.env.FIREBASE_MEASUREMENT_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

class FirebaseService {
  // Obtener todas las citas disponibles
  async getAvailableAppointments() {
    try {
      const citasRef = collection(db, 'citas_disponibles');
      const q = query(citasRef, where('estado', '==', true));
      const snapshot = await getDocs(q);
      
      const appointments = [];
      snapshot.forEach(doc => {
        appointments.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      return appointments;
    } catch (error) {
      console.error('Error obteniendo citas:', error);
      return [];
    }
  }

  // Obtener citas por especialidad
  async getAppointmentsBySpecialty(specialty) {
    try {
      const citasRef = collection(db, 'citas_disponibles');
      const q = query(
        citasRef,
        where('estado', '==', true),
        where('especialidad', '==', specialty)
      );
      const snapshot = await getDocs(q);
      
      const appointments = [];
      snapshot.forEach(doc => {
        appointments.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      return appointments;
    } catch (error) {
      console.error('Error obteniendo citas por especialidad:', error);
      return [];
    }
  }

  // Obtener citas por doctor
  async getAppointmentsByDoctor(doctorName) {
    try {
      const citasRef = collection(db, 'citas_disponibles');
      const q = query(
        citasRef,
        where('estado', '==', true),
        where('nombre_doctor', '==', doctorName)
      );
      const snapshot = await getDocs(q);
      
      const appointments = [];
      snapshot.forEach(doc => {
        appointments.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      return appointments;
    } catch (error) {
      console.error('Error obteniendo citas por doctor:', error);
      return [];
    }
  }

  // Obtener citas por fecha
  async getAppointmentsByDate(date) {
    try {
      const citasRef = collection(db, 'citas_disponibles');
      const q = query(
        citasRef,
        where('estado', '==', true),
        where('fecha', '==', date)
      );
      const snapshot = await getDocs(q);
      
      const appointments = [];
      snapshot.forEach(doc => {
        appointments.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      return appointments;
    } catch (error) {
      console.error('Error obteniendo citas por fecha:', error);
      return [];
    }
  }
}

export default new FirebaseService();