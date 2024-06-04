import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text, FlatList, TouchableOpacity } from 'react-native';
import { db, auth } from '../services/firebaseConfig';
import { collection, query, where, onSnapshot, doc, getDocs, updateDoc, deleteDoc, writeBatch } from 'firebase/firestore';
import { useFocusEffect } from '@react-navigation/native';
import TopBar from '../components/TopBar';
import BottomMenuBar from '../components/BottomMenuBar';
import BackButton from '../components/BackButton';
import Icon from 'react-native-vector-icons/FontAwesome';

const NotificationsScreen = () => {
  const [notificaciones, setNotificaciones] = useState([]);

  useEffect(() => {
    const fetchUserNotifications = async () => {
      try {
        const userQuery = query(collection(db, 'usuarios'), where('correo', '==', auth.currentUser.email));
        const userSnapshot = await getDocs(userQuery);

        if (!userSnapshot.empty) {
          const userDocRef = userSnapshot.docs[0].ref;

          const q = query(collection(db, 'notificaciones'), where('usuarioRef', '==', userDocRef));

          const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const loadedNotificaciones = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            loadedNotificaciones.sort((a, b) => b.fecha.toDate() - a.fecha.toDate());
            setNotificaciones(loadedNotificaciones);
          });

          return () => unsubscribe();
        } else {
          console.error('No se encontró el documento del usuario.');
        }
      } catch (error) {
        console.error('Error al obtener el documento del usuario:', error);
      }
    };

    fetchUserNotifications();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      const markAllAsRead = async () => {
        try {
          const unreadNotifications = notificaciones.filter(notificacion => !notificacion.leida);

          for (const notificacion of unreadNotifications) {
            const notificacionRef = doc(db, 'notificaciones', notificacion.id);
            await updateDoc(notificacionRef, { leida: true });
          }
        } catch (error) {
          console.error('Error al marcar las notificaciones como leídas:', error);
        }
      };

      return () => {
        if (notificaciones.length > 0) {
          markAllAsRead();
        }
      };
    }, [notificaciones])
  );

  const marcarComoLeida = async (id) => {
    try {
      const notificacionRef = doc(db, 'notificaciones', id);
      await deleteDoc(notificacionRef);
      setNotificaciones(prev => prev.filter(n => n.id !== id));
    } catch (error) {
      console.error('Error al marcar como leída:', error);
    }
  };

  const limpiarNotificaciones = async () => {
    try {
      const batch = writeBatch(db);
      notificaciones.forEach((notificacion) => {
        const notificacionRef = doc(db, 'notificaciones', notificacion.id);
        batch.delete(notificacionRef);
      });
      await batch.commit();
      setNotificaciones([]);
    } catch (error) {
      console.error('Error al limpiar las notificaciones:', error);
    }
  };

  const renderItem = ({ item }) => {
    const fecha = item.fecha.toDate();
    const hora = fecha.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const fechaResumida = fecha.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: '2-digit' });

    return (
      <View style={[styles.notificacion, item.leida ? styles.notificacionLeida : styles.notificacionNoLeida]}>
        <View style={styles.notificacionContent}>
          <Text style={styles.mensaje}>{item.mensaje}</Text>
          <Text style={styles.fechaHora}>{fechaResumida} {hora}</Text>
        </View>
        <TouchableOpacity style={styles.marcarComoLeidaButton} onPress={() => marcarComoLeida(item.id)}>
          <Text style={styles.marcarComoLeidaText}><Icon name="times" size={11} color="#fff" /></Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <TopBar />
      <View style={styles.headerContainer}>
        <BackButton />
        <Text style={styles.title}>Notificaciones</Text>
      </View>
      <TouchableOpacity style={styles.clearButton} onPress={limpiarNotificaciones}>
        <Text style={styles.clearButtonText}>Limpiar notificaciones</Text>
      </TouchableOpacity>
      <FlatList
        data={notificaciones}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.notificacionList}
      />
      <BottomMenuBar isMenuScreen={true} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#030A8C',
    marginLeft: 10,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 10,
  },
  clearButton: {
    alignSelf: 'flex-end',
    marginRight: 20,
    marginBottom: 10,
  },
  clearButtonText: {
    color: '#030A8C',
    fontSize: 14,
  },
  notificacionList: {
    padding: 10,
    paddingBottom: 80, // Agrega espacio adicional al final de la lista
  },
  notificacion: {
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    marginHorizontal: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  notificacionLeida: {
    backgroundColor: '#e0e0e0',
  },
  notificacionNoLeida: {
    backgroundColor: '#fff',
  },
  notificacionContent: {
    flex: 1,
    marginRight: 10,
  },
  mensaje: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  fechaHora: {
    fontSize: 14,
    color: '#888',
  },
  marcarComoLeidaButton: {
    backgroundColor: '#030A8C',
    borderRadius: 5,
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  marcarComoLeidaText: {
    color: '#fff',
    fontSize: 14,
  },
});

export default NotificationsScreen;
