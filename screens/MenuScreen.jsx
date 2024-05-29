import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Alert, ScrollView, SafeAreaView } from 'react-native';
import TopBar from '../components/TopBar';
import BottomMenuBar from '../components/BottomMenuBar';
import { getAuth, signOut } from 'firebase/auth';
import { getDocs, query, collection, where } from 'firebase/firestore';
import { db } from '../services/firebaseConfig';

const options = [
  { id: '1', label: 'Notificaciones', icon: require('../assets/rscMenu/notificationIcon.png'), screen: 'Notifications' },
  { id: '2', label: 'Favoritos', icon: require('../assets/rscMenu/favIcon.png'), screen: 'Favorites' },
  { id: '3', label: 'Historial', icon: require('../assets/rscMenu/historyIcon.png'), screen: 'History' },
  { id: '4', label: 'Mis productos', icon: require('../assets/rscMenu/productsIcon.png'), screen: 'MyProducts' },
  { id: '5', label: 'Mis reseñas', icon: require('../assets/rscMenu/reviewsIcon.png'), screen: 'MyReviews' },
  { id: '6', label: 'Información personal', icon: require('../assets/rscMenu/userIcon.png'), screen: 'PersonalInfo' },
  { id: '7', label: 'Tarjetas', icon: require('../assets/rscMenu/cardsIcon.png'), screen: 'Cards' },
];

const MenuScreen = ({ navigation }) => {
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      const auth = getAuth();
      const user = auth.currentUser;
      if (user) {
        try {
          const q = query(collection(db, 'usuarios'), where('correo', '==', user.email));
          const querySnapshot = await getDocs(q);
          if (!querySnapshot.empty) {
            const userDoc = querySnapshot.docs[0];
            setUserData(userDoc.data());
          } else {
            console.error('No se encontró el usuario con el correo:', user.email);
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      }
    };

    fetchUserData();
  }, []);

  const handleLogout = () => {
    Alert.alert(
      'Cerrar sesión',
      '¿Estás seguro de que quieres cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sí', onPress: () => {
            const auth = getAuth();
            signOut(auth).then(() => {
              navigation.replace('Login'); // Redirige al usuario a la pantalla de inicio de sesión
            }).catch((error) => {
              console.error('Error al cerrar sesión:', error);
            });
          }
        },
      ],
      { cancelable: false }
    );
  };

  const handleOptionPress = (option) => {
    navigation.navigate(option.screen, { label: option.label });
  };

  if (!userData) {
    return (
      <SafeAreaView style={styles.safeContainer}>
        <TopBar />
        <Text style={styles.menuTitle}>Menú</Text>
        <Text style={styles.loadingText}>Cargando datos del usuario...</Text>
        <BottomMenuBar isMenuScreen={true} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeContainer}>
      <TopBar />
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.contentContainer}>
          <Text style={styles.menuTitle}>Menú</Text>
          <TouchableOpacity style={styles.userContainer}>
            <Image source={{ uri: userData.foto }} style={styles.userPhoto} />
            <View style={styles.userInfo}>
              <Text style={styles.userName} numberOfLines={1} ellipsizeMode="tail">{userData.nombre}</Text>
              <View style={styles.ratingContainer}>
                <Text style={styles.userRating}>4.5</Text>
                <Image source={require('../assets/rscMenu/starCalification.png')} style={styles.starIcon} />
              </View>
            </View>
          </TouchableOpacity>
          <View style={styles.optionsContainer}>
            {options.map((option) => (
              <TouchableOpacity key={option.id} style={styles.optionButton} onPress={() => handleOptionPress(option)}>
                <Image source={option.icon} style={styles.optionIcon} />
                <Text style={styles.optionText}>{option.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutButtonText}>Cerrar Sesión</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      <BottomMenuBar isMenuScreen={true} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: 'white',
  },
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  scrollContainer: {
    flexGrow: 1,
  },
  contentContainer: {
    paddingBottom: 120, // Espacio adicional para el BottomMenuBar
  },
  menuTitle: {
    fontSize: 22,
    marginVertical: 20,
    color: '#030A8C',
    paddingLeft: 25,
  },
  userContainer: {
    flexDirection: 'row',
    padding: 25,
    marginHorizontal: 20,
    marginBottom: 10,
    backgroundColor: '#ffffff',
    borderRadius: 10,
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  userPhoto: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  userInfo: {
    marginLeft: 10,
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#030A8C',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  starIcon: {
    width: 20,
    height: 20,
    marginLeft: 5,
  },
  userRating: {
    fontSize: 18,
  },
  noUserText: {
    fontSize: 18,
    color: 'red',
    textAlign: 'center',
    marginVertical: 20,
  },
  loadingText: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    marginVertical: 20,
  },
  optionsContainer: {
    marginTop: 20,
    paddingHorizontal: 20,
    backgroundColor: '#ffffff',
    borderRadius: 10,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    padding: 20,
    marginHorizontal: 20,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
  },
  optionIcon: {
    width: 20,
    height: 20,
    marginRight: 20,
  },
  optionText: {
    fontSize: 18,
    color: 'black',
  },
  logoutButton: {
    backgroundColor: '#030A8C',
    paddingVertical: 10,
    borderRadius: 10,
    marginHorizontal: 20,
    marginTop: 25,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  logoutButtonText: {
    color: 'white',
    fontSize: 15,
  },
});

export default MenuScreen;
