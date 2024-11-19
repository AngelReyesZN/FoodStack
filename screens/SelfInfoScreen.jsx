import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, FlatList, TouchableOpacity } from 'react-native';
import SearchBar from '../components/SearchBar';
import BackButton from '../components/BackButton';
import BottomMenuBar from '../components/BottomMenuBar';
import Icon from 'react-native-vector-icons/FontAwesome';
import { getAuth } from 'firebase/auth';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../services/firebaseConfig';
import MainProductCardEdit from '../components/MainProductCardEdit';
import CustomText from '../components/CustomText';

const SelfInfoScreen = ({ navigation }) => {
  const [user, setUser] = useState(null);
  const [userProducts, setUserProducts] = useState([]);
  const [userRating, setUserRating] = useState('-');
  const [timeInApp, setTimeInApp] = useState('');
  const [timeMeasure, setTimeMeasure] = useState('');

  useEffect(() => {
    const fetchUserData = async () => {
      const auth = getAuth();
      const currentUser = auth.currentUser;
      if (currentUser) {
        try {
          const q = query(collection(db, 'usuarios'), where('correo', '==', currentUser.email));
          const querySnapshot = await getDocs(q);
          if (!querySnapshot.empty) {
            const userDoc = querySnapshot.docs[0];
            const userData = userDoc.data();
            setUser({ ...userData, id: userDoc.id });

            // Calcular el tiempo en la aplicación
            const registrationDate = userData.registroFecha?.toDate();
            if (registrationDate) {
              const now = new Date();
              const timeDiff = now - registrationDate;
              const daysInApp = timeDiff / (1000 * 60 * 60 * 24);

              let timeDisplay, timeMeasure;
              if (daysInApp < 31) {
                timeDisplay = `${Math.floor(daysInApp)}`;
                timeMeasure = 'días';
              } else if (daysInApp < 365) {
                const monthsInApp = (daysInApp / 30.44).toFixed(1); // Aproximadamente 30.44 días en un mes
                timeDisplay = `${monthsInApp}`;
                timeMeasure = 'meses';
              } else {
                const yearsInApp = (daysInApp / 365).toFixed(1);
                timeDisplay = `${yearsInApp}`;
                timeMeasure = 'años';
              }
              setTimeInApp(timeDisplay);
              setTimeMeasure(timeMeasure);
            }

            // Fetch user products
            fetchUserProducts(userDoc.id);
          } else {
            console.error('No se encontró el usuario con el correo:', currentUser.email);
          }
        } catch (error) {
          console.error('Error al obtener datos del usuario:', error);
        }
      }
    };

    const fetchUserProducts = async (userId) => {
      try {
        const q = query(collection(db, 'productos'), where('vendedorRef', '==', doc(db, 'usuarios', userId)));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          const products = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setUserProducts(products);

          const productRefs = products.map(product => doc(db, 'productos', product.id));
          if (productRefs.length > 0) {
            const reviewsQuery = query(collection(db, 'resenas'), where('productoRef', 'in', productRefs));
            const reviewsSnapshot = await getDocs(reviewsQuery);
            if (!reviewsSnapshot.empty) {
              const reviews = reviewsSnapshot.docs.map(doc => doc.data());
              const ratings = reviews.map(review => review.calificacionResena);

              if (ratings.length > 0) {
                const totalRating = ratings.reduce((sum, rating) => sum + rating, 0);
                setUserRating((totalRating / ratings.length).toFixed(1));
              }
            }
          }
        } else {
          console.log('No se encontraron productos para este usuario.');
        }
      } catch (error) {
        console.error('Error al cargar los productos del usuario:', error);
      }
    };

    fetchUserData();
  }, []);

  const renderItem = ({ item }) => {
    if (item.cantidad <= 0 || !item.statusView) {
      return null; // No renderiza este item si la cantidad es 0 o si statusView es falso
    }

    return (
      <MainProductCardEdit
        product={item}
        onEditPress={() => navigation.navigate('EditProduct', { productId: item.id })}
      />
    );
  };

  if (!user) {
    return <CustomText>Cargando...</CustomText>;
  }

  return (
    <View style={styles.container}>
      <SearchBar />
      <View style={styles.imageContainer}>
        <Image source={require('../assets/rscMenu/BackgroundImage.png')} style={styles.backgroundImage} />
        <View style={styles.backButtonContainer}>
          <BackButton />
        </View>
      </View>
      <View style={styles.profileContainer}>
        <Image source={{ uri: user.foto || 'path/to/default/image' }} style={styles.profileImage} />
      </View>
      <CustomText style={styles.userName} fontWeight='SemiBold'>{user.nombre}</CustomText>
      <CustomText style={styles.userInfo}>
        {user.descripcionUsuario || 'Sin descripción disponible.'}
      </CustomText>
      <View style={styles.detailsContainer}>
        <View style={styles.detailItem}>
          <View style={styles.ratingContainer}>
            <CustomText style={styles.ratingText}>{userRating}</CustomText>
            <Icon name="star" size={19} color="#FF6347" style={styles.starIcon} />
          </View>
          <CustomText style={styles.detailLabel} fontWeight='Medium'>Calificación</CustomText>
        </View>
        <View style={styles.detailItem}>
          <CustomText style={styles.monthsText}>{timeInApp}</CustomText>
          <CustomText style={styles.detailLabel} fontWeight='Medium'>{timeMeasure}</CustomText>
        </View>
      </View>
      <CustomText style={styles.allProductsText} fontWeight='SemiBold'>Productos</CustomText>
      {userProducts.length === 0 ? (
        <CustomText style={styles.noProductsText}>No hay productos para mostrar.</CustomText>
      ) : (
        <FlatList
          data={userProducts}
          renderItem={renderItem}
          keyExtractor={item => item.id.toString()}
          numColumns={2}
          contentContainerStyle={[styles.productList, { paddingBottom: 80 }]}
        />
      )}
      <BottomMenuBar />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: 125,
  },
  backgroundImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  backButtonContainer: {
    position: 'absolute',
    top: 10,
    left: 10,
  },
  profileContainer: {
    alignItems: 'center',
    marginTop: -60,
  },
  profileImage: {
    width: 110,
    height: 110,
    borderRadius: 10,
  },
  userName: {
    fontSize: 20,
    paddingTop: 15,
    alignSelf: 'center'
  },
  userInfo: {
    fontSize: 16,
    color: '#000',
    paddingHorizontal: 30,
    paddingVertical: 20,
    textAlign: 'justify',
  },
  detailsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
    marginBottom: 15,
  },
  detailItem: {
    alignItems: 'center',
    marginHorizontal: 50,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 18,
    color: '#000',
    marginRight: 2,
  },
  starIcon: {
    marginLeft: 2,
  },
  detailLabel: {
    fontSize: 19,
    color: '#767272',
    marginTop: 5,
  },
  monthsText: {
    fontSize: 18,
    color: '#000',
  },
  allProductsText: {
    fontSize: 17,
    marginLeft: 30,
    marginTop: 20,
    marginBottom: 15,
  },
  noProductsText: {
    fontSize: 16,
    color: '#000',
    textAlign: 'center',
    marginTop: 20,
  },
  productList: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 4,
  },
});

export default SelfInfoScreen;
