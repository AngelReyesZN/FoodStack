// src/services/notifications.js
import { db } from './firebaseConfig';
import { collection, addDoc, Timestamp } from 'firebase/firestore';

const agregarNotificacion = async (usuarioRef, mensaje) => {
  try {
    await addDoc(collection(db, 'notificaciones'), {
      usuarioRef, // Almacenar como referencia
      mensaje,
      fecha: Timestamp.now(),
      leida: false
    });
  } catch (error) {
    console.error('Error al agregar notificación:', error);
  }
};

export { agregarNotificacion };
