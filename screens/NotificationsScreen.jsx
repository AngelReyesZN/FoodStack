import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text, FlatList, TouchableOpacity } from 'react-native';
import { db, auth } from '../services/firebaseConfig';
import { collection, query, where, onSnapshot, doc, getDocs, deleteDoc } from 'firebase/firestore';
import TopBar from '../components/TopBar';
import BottomMenuBar from '../components/BottomMenuBar';
import BackButton from '../components/BackButton';

const NotificationsScreen = () => {
  const [notificaciones, setNotificaciones] = useState([]);

  useEffect(() => {
    const fetchUserNotifications = async () => {
      try {
        const userQuery = query(collection(db, 'usuarios'), where('correo', '==', auth.currentUser.email));
        const userSnapshot = await getDocs(userQuery);

        if (!userSnapshot.empty) {
          const userDocRef = userSnapshot.docs[0].ref;
          // console.log('Usuario Ref:', userDocRef.path);

          const q = query(collection(db, 'notificaciones'), where('usuarioRef', '==', userDocRef));

          const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const loadedNotificaciones = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            // console.log('Notificaciones obtenidas:', loadedNotificaciones);
            // Ordenar notificaciones por fecha en orden descendente
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

  const marcarComoLeida = async (id) => {
    try {
      const notificacionRef = doc(db, 'notificaciones', id);
      await deleteDoc(notificacionRef);
      setNotificaciones(prev => prev.filter(n => n.id !== id));
    } catch (error) {
      console.error('Error al marcar como leída:', error);
    }
  };

  const renderItem = ({ item }) => {
    const fecha = item.fecha.toDate();
    const hora = fecha.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const fechaResumida = fecha.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: '2-digit' });

    return (
      <View style={[styles.notificacion, item.leida && styles.notificacionLeida]}>
        <View style={styles.notificacionContent}>
          <Text style={styles.mensaje}>{item.mensaje}</Text>
          <Text style={styles.fechaHora}>{fechaResumida} {hora}</Text>
        </View>
        <TouchableOpacity style={styles.marcarComoLeidaButton} onPress={() => marcarComoLeida(item.id)}>
          <Text style={styles.marcarComoLeidaText}>Marcar como leída</Text>
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
  notificacionList: {
    padding: 10,
  },
  notificacion: {
    padding: 15,
    borderRadius: 10,
    backgroundColor: '#fff',
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
