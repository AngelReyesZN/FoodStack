import React, { useContext } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Alert, BackHandler, ScrollView, SafeAreaView } from 'react-native';
import TopBar from '../components/TopBar';
import BottomMenuBar from '../components/BottomMenuBar';
import { UserContext } from '../context/UserContext';

const options = [
  { id: '1', label: 'Notificaciones', icon: require('../assets/rscMenu/notificationIcon.png') },
  { id: '2', label: 'Favoritos', icon: require('../assets/rscMenu/favIcon.png') },
  { id: '3', label: 'Historial', icon: require('../assets/rscMenu/historyIcon.png') },
  { id: '4', label: 'Mis productos', icon: require('../assets/rscMenu/productsIcon.png') },
  { id: '5', label: 'Mis reseñas', icon: require('../assets/rscMenu/reviewsIcon.png') },
  { id: '6', label: 'Información personal', icon: require('../assets/rscMenu/userIcon.png') },
  { id: '7', label: 'Tarjetas', icon: require('../assets/rscMenu/cardsIcon.png') },
];

const MenuScreen = ({ navigation }) => {
  const { user, setUser } = useContext(UserContext);

  const handleLogout = () => {
    Alert.alert(
      'Cerrar sesión',
      '¿Estás seguro de que quieres cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sí', onPress: () => {
            setUser(null);
            navigation.replace('Login'); // Redirige al usuario a la pantalla de inicio de sesión
            BackHandler.exitApp(); // Cerrar la aplicación
          }
        },
      ],
      { cancelable: false }
    );
  };

  if (!user) {
    return (
      <SafeAreaView style={styles.safeContainer}>
        <TopBar />
        <Text style={styles.menuTitle}>Menú</Text>
        <Text style={styles.noUserText}>No hay usuario autenticado</Text>
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
            <Image source={user.foto} style={styles.userPhoto} />
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{user.nombre}</Text>
              <View style={styles.ratingContainer}>
                <Text style={styles.userRating}>{user.calificacion}</Text>
                <Image source={require('../assets/rscMenu/starCalification.png')} style={styles.starIcon} />
              </View>
            </View>
          </TouchableOpacity>
          <View style={styles.optionsContainer}>
            {options.map((option) => (
              <TouchableOpacity key={option.id} style={styles.optionButton}>
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
    width: 40,
    height: 40,
    borderRadius: 25,
  },
  userInfo: {
    marginLeft: 10,
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#030A8C',
    paddingLeft: 15,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starIcon: {
    width: 25,
    height: 25,
    marginLeft: 10,
  },
  userRating: {
    fontSize: 25,
  },
  noUserText: {
    fontSize: 18,
    color: 'red',
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
