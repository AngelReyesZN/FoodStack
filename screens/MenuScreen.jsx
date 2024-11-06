import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Alert, ScrollView, SafeAreaView, Dimensions } from 'react-native';
import TopBar from '../components/TopBar';
import BottomMenuBar from '../components/BottomMenuBar';
import { getAuth, signOut } from 'firebase/auth';
import { getDocs, query, collection, where, onSnapshot, doc } from 'firebase/firestore';
import { db } from '../services/firebaseConfig';
import Icon from 'react-native-vector-icons/FontAwesome';
import CustomText from '../components/CustomText';


const options = [
  { id: '1', label: 'Notificaciones', icon: require('../assets/rscMenu/campana.png'), screen: 'Notifications' },
  { id: '2', label: 'Favoritos', icon: require('../assets/rscMenu/corazon.png'), screen: 'Favorites' },
  { id: '3', label: 'Historial', icon: require('../assets/rscMenu/tiempo-adelante.png'), screen: 'History' },
  { id: '4', label: 'Mis productos', icon: require('../assets/rscMenu/producto.png'), screen: 'MyProducts' },
  { id: '5', label: 'Mis reseñas', icon: require('../assets/rscMenu/review.png'), screen: 'MyReviews' },
  { id: '6', label: 'Información personal', icon: require('../assets/rscMenu/user.png'), screen: 'PersonalInfo' },
  { id: '7', label: 'Tarjetas', icon: require('../assets/rscMenu/tarjeta.png'), screen: 'Cards' },
];

const MenuScreen = ({ navigation }) => {
  const [userData, setUserData] = useState(null);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [userRating, setUserRating] = useState('-');

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
            fetchUnreadNotifications(userDoc.ref);
            fetchUserRating(userDoc.id);
          } else {
            console.error('No se encontró el usuario con el correo:', user.email);
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      }
    };

    const fetchUnreadNotifications = (userDocRef) => {
      const q = query(collection(db, 'notificaciones'), where('usuarioRef', '==', userDocRef), where('leida', '==', false));
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        setUnreadNotifications(querySnapshot.size);
      });
      return () => unsubscribe();
    };

    const fetchUserRating = async (userId) => {
      //try {
        const q = query(collection(db, 'productos'), where('vendedorRef', '==', doc(db, 'usuarios', userId)));
        const querySnapshot = await getDocs(q);
        const products = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        const productRefs = products.map(product => doc(db, 'productos', product.id));
        const reviewsQuery = query(collection(db, 'resenas'), where('productoRef', 'in', productRefs));
        const reviewsSnapshot = await getDocs(reviewsQuery);
        const reviews = reviewsSnapshot.docs.map(doc => doc.data());
        const ratings = reviews.map(review => review.calificacionResena);

        if (ratings.length > 0) {
          const totalRating = ratings.reduce((sum, rating) => sum + rating, 0);
          setUserRating((totalRating / ratings.length).toFixed(1));
        }
      //} catch (error) {
        //console.error('Error fetching user rating:', error);
      //}
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
              navigation.reset({
                index: 0,
                routes: [{ name: 'Login' }], // Deja solo la pantalla de Login en el historial
              });
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

  const navigateToUserInfo = () => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (user) {
      navigation.navigate('SelfInfoScreen', { userId: user.uid });
    }
  };

  if (!userData) {
    return (
      <SafeAreaView style={styles.safeContainer}>
        <TopBar />
        <CustomText style={styles.loadingText}>Cargando datos del usuario...</CustomText>
        <BottomMenuBar isMenuScreen={true} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeContainer}>
      <TopBar />
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.contentContainer}>
          <TouchableOpacity style={styles.userContainer} onPress={navigateToUserInfo}>
            <Image source={{ uri: userData.foto }} style={styles.userPhoto} />
            <View style={styles.userInfo}>
              <CustomText style={styles.userName} fontWeight='Bold' numberOfLines={1} ellipsizeMode="tail">
                {userData.nombre.split(' ').slice(0, 2).join(' ')}
              </CustomText>
              <View style={styles.ratingContainer}>
                <CustomText style={styles.labelText} fontWeight='Medium'>
                  Calificación:
                </CustomText>
                <CustomText style={styles.ratingText} fontWeight='Regular'>
                  {'  ' + userRating + '  '}
                </CustomText>
                <Icon name="star" size={17} color="#FF6347" />
              </View>
            </View>
          </TouchableOpacity>
          <View style={styles.separator} />
          <View style={styles.optionsContainer}>
            {options.map((option) => (
              <TouchableOpacity key={option.id} style={styles.optionButton} onPress={() => handleOptionPress(option)}>
                <Image source={option.icon} style={styles.optionIcon} />
                <CustomText style={styles.optionText} fontWeight='Regular'>{option.label}</CustomText>
                {option.id === '1' && unreadNotifications > 0 && (
                  <View style={styles.notificationBadge}>
                    <Text style={styles.notificationBadgeText}>{unreadNotifications}</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
          <View style={styles.separator} />
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <CustomText style={styles.logoutButtonText} fontWeight='Regular'>Cerrar Sesión</CustomText>
          </TouchableOpacity>
        </View>
      </ScrollView>
      <BottomMenuBar isMenuScreen={true} />
    </SafeAreaView>
  );
};

const { width, height } = Dimensions.get('window');
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
    paddingBottom: height * .1,
  },
  userContainer: {
    flexDirection: 'row',
    padding: 25,
    marginHorizontal: 20,
    marginBottom: 20,
    marginTop: 20,
    alignItems: 'center',
  },
  userPhoto: {
    width: 80,
    height: 80,
    borderRadius: 10,
  },
  userInfo: {
    marginLeft: 15,
    flex: 1,
  },
  userName: {
    fontSize: 18,
    color: 'black',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  starIcon: {
    width: 20,
    height: 20,
  },
  userRating: {
    fontSize: 18,
  },
  labelText: {
    color: '#767272'
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
  separator: {
    height: .5,
    backgroundColor: '#C1C1C1',
    width: '85%',
    alignSelf: 'center',
  },
  optionsContainer: {
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 20,
    marginTop: 20,
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
    fontSize: 16,
    color: 'black',
    flex: 1,
  },
  logoutButton: {
    marginHorizontal: 20,
    marginTop: 25,
    alignItems: 'left',
    justifyContent: 'center',
  },
  logoutButtonText: {
    color: '#F50000',
    fontSize: 20,
  },
  notificationBadge: {
    backgroundColor: 'red',
    borderRadius: 10,
    paddingHorizontal: 5,
    paddingVertical: 2,
    marginLeft: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default MenuScreen;
