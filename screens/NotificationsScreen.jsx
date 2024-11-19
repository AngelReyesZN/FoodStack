import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Dimensions, FlatList, TouchableOpacity, Image } from 'react-native';
import { db, auth } from '../services/firebaseConfig';
import { collection, query, where, onSnapshot, doc, getDocs, updateDoc, deleteDoc, writeBatch } from 'firebase/firestore';
import { useFocusEffect } from '@react-navigation/native';
import TopBar from '../components/TopBar';
import BottomMenuBar from '../components/BottomMenuBar';
import CustomText from '../components/CustomText';
import Header from '../components/Header';

const icon = require('../assets/rscMenu/campana.png');

const NotificationsScreen = () => {
  const [notificaciones, setNotificaciones] = useState([]);

  const renderHeader = () => (
    <View>
      <Header title="Notificaciones" showBackButton={true} icon={icon} />
      <View style={styles.separator} />
      <TouchableOpacity style={styles.clearButton} onPress={handleClearNotifications}>
        <CustomText style={styles.clearButtonText}>Limpiar notificaciones</CustomText>
      </TouchableOpacity>
    </View>
  );

  const handleClearNotifications = async () => {
    try {
      const userQuery = query(collection(db, 'usuarios'), where('correo', '==', auth.currentUser.email));
      const userSnapshot = await getDocs(userQuery);

      if (!userSnapshot.empty) {
        const userDocRef = userSnapshot.docs[0].ref;
        const q = query(collection(db, 'notificaciones'), where('usuarioRef', '==', userDocRef));
        const snapshot = await getDocs(q);

        const batch = writeBatch(db);
        snapshot.forEach((doc) => {
          batch.delete(doc.ref);
        });
        await batch.commit();

        setNotificaciones([]);
      } else {
        console.error('No se encontró el documento del usuario.');
      }
    } catch (error) {
      console.error('Error al limpiar las notificaciones:', error);
    }
  };

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
            setNotificaciones(groupByDate(loadedNotificaciones));
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
          for (const group of notificaciones) {
            for (const notificacion of group.data) {
              if (!notificacion.leida) {
                const notificacionRef = doc(db, 'notificaciones', notificacion.id);
                await updateDoc(notificacionRef, { leida: true });
              }
            }
          }
        } catch (error) {
          console.error('Error al marcar las notificaciones como leídas:', error);
        }
      };

      if (notificaciones.length > 0) {
        markAllAsRead();
      }
    }, [notificaciones])
  );

  const groupByDate = (notificaciones) => {
    const grouped = {};
    notificaciones.forEach((notificacion) => {
      const dateKey = notificacion.fecha.toDate().toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: '2-digit' });
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(notificacion);
    });
    return Object.entries(grouped).map(([fecha, data]) => ({ fecha, data }));
  };

  const renderNotificacion = ({ item }) => {
    const hora = item.fecha.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    return (
      <View style={styles.notificacion}>
        <View style={styles.notificacionContent}>
          <CustomText style={styles.mensaje} fontWeight='SemiBold'>{item.mensaje}</CustomText>
          <CustomText style={styles.fechaHora}>{hora}</CustomText>
        </View>
        <TouchableOpacity style={styles.marcarComoLeidaButton} onPress={() => marcarComoLeida(item.id)}>
          <CustomText style={styles.deleteLabel}>Eliminar</CustomText>
        </TouchableOpacity>
      </View>
    );
  };

  const renderGroup = ({ item }) => (
    <View>
      <CustomText style={styles.fecha} fontWeight="SemiBold">{item.fecha}</CustomText>
      {item.data.map((notificacion, index) => (
        <View key={notificacion.id}>
          {renderNotificacion({ item: notificacion })}
          {index < item.data.length - 1 && <View style={styles.separatorN} />}
        </View>
      ))}
    </View>
  );

  const marcarComoLeida = async (id) => {
    try {
      const notificacionRef = doc(db, 'notificaciones', id);
      await deleteDoc(notificacionRef);
      setNotificaciones((prev) =>
        prev.map((group) => ({
          ...group,
          data: group.data.filter((n) => n.id !== id),
        }))
      );
    } catch (error) {
      console.error('Error al marcar como leída:', error);
    }
  };

  return (
    <View style={styles.container}>
      <TopBar />
      <FlatList
        data={notificaciones}
        renderItem={renderGroup}
        keyExtractor={(item) => item.fecha}
        contentContainerStyle={styles.notificacionList}
        ListHeaderComponent={renderHeader}
      />
      <BottomMenuBar isMenuScreen={true} />
    </View>
  );
};

const { width, height } = Dimensions.get('window');
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    paddingBottom: height * 0.1,
  },
  separator: {
    height: 1,
    backgroundColor: '#C1C1C1',
    width: '85%',
    alignSelf: 'center',
    marginTop: 20,
  },
  separatorN: {
    height: 1,
    backgroundColor: '#E0E0E0',
    width: '85%',
    alignSelf: 'center',
    marginTop: 12,
  },
  clearButton: {
    alignSelf: 'flex-end',
    marginRight: 20,
    marginBottom: 10,
    marginTop: 10,
  },
  clearButtonText: {
    color: '#FF6347',
    fontSize: 14,
  },
  notificacionList: {
    padding: 10,
  },
  notificacion: {
    padding: 15,
    marginHorizontal: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  notificacionContent: {
    flex: 1,
  },
  mensaje: {
    fontSize: 16,
    color: '#333',
    marginBottom: 5,
  },
  fechaHora: {
    fontSize: 14,
    color: '#717171',
  },
  fecha: {
    fontSize: 18,
    color: '#A0A0A0',
    marginVertical: 10,
    textAlign: 'left',
    marginLeft: 10,
    marginTop: 23,
  },
  deleteLabel: {
    color: "#C3AFAF",
    textDecorationLine: 'underline',
  },
});

export default NotificationsScreen;
