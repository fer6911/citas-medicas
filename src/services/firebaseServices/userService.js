import admin from 'firebase-admin';

const db = admin.firestore();

class UserService {

  async registerUser(userId, nombre) {
    try {
      await db.collection("usuarios").doc(userId).set({
        user_id: userId,
        nombre: nombre || "",
        creado_en: new Date().toISOString()
      });

      console.log(`Usuario registrado: ${userId}`);
      return true;

    } catch (error) {
      console.error("Error registrando usuario:", error);
      return false;
    }
  }

  async getUser(userId) {
    try {
      const snap = await db.collection("usuarios").doc(userId).get();

      if (!snap.exists) return null;

      return snap.data();

    } catch (error) {
      console.error("Error obteniendo usuario:", error);
      return null;
    }
  }

}

export default new UserService();
