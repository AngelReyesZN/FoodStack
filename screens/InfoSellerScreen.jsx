import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, FlatList, TouchableOpacity, Dimensions } from 'react-native';
import SearchBar from '../components/SearchBar';
import BackButton from '../components/BackButton';
import BottomMenuBar from '../components/BottomMenuBar';
import Icon from 'react-native-vector-icons/FontAwesome';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../services/firebaseConfig';
import CustomText from '../components/CustomText';
import MainProductCard from '../components/MainProductCard';



const InfoSeller = ({ route, navigation }) => {
  const { sellerId } = route.params;
  const [seller, setSeller] = useState(null);
  const [sellerProducts, setSellerProducts] = useState([]);
  const [sellerRating, setSellerRating] = useState('-');
  const [timeInApp, setTimeInApp] = useState('');
  const [timeMeasure, setTimeMeasure] = useState('');

  useEffect(() => {
    const fetchSellerData = async () => {
      try {
        const sellerDoc = await getDoc(doc(db, 'usuarios', sellerId));
        if (sellerDoc.exists()) {
          const sellerData = sellerDoc.data();
          setSeller(sellerData);

          // Calculate time in app
          const registroFecha = sellerData.registroFecha.toDate();
          const currentDate = new Date();
          const diffTime = Math.abs(currentDate - registroFecha);
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

          let timeDisplay, timeMeasure;
          if (diffDays < 31) {
            timeDisplay = `${Math.floor(diffDays)}`;
            timeMeasure = 'días';
          } else if (diffDays < 365) {
            const monthsInApp = (diffDays / 30.44).toFixed(1); // Aproximadamente 30.44 días en un mes
            timeDisplay = `${monthsInApp}`;
            timeMeasure = 'meses';
          } else {
            const yearsInApp = (diffDays / 365).toFixed(1);
            timeDisplay = `${yearsInApp}`;
            timeMeasure = 'años';
          }
          setTimeInApp(timeDisplay);
          setTimeMeasure(timeMeasure);
        } else {
          console.error("Vendedor no encontrado");
        }
      } catch (error) {
        console.error("Error al cargar los datos del vendedor:", error);
      }
    };

    const fetchSellerProducts = async () => {
      try {
        const q = query(collection(db, 'productos'), where('vendedorRef', '==', doc(db, 'usuarios', sellerId)));
        const querySnapshot = await getDocs(q);
        const products = querySnapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .filter(product => product.statusView && product.cantidad > 0);
        setSellerProducts(products);

        const productIds = products.map(product => product.id);
        const reviewsRef = collection(db, 'resenas');
        const reviewsQuery = query(reviewsRef, where('productoRef', 'in', productIds.map(id => doc(db, 'productos', id))));
        const reviewsSnapshot = await getDocs(reviewsQuery);

        const reviews = reviewsSnapshot.docs.map(doc => doc.data());
        const ratings = reviews.map(review => review.calificacionResena);

        if (ratings.length > 0) {
          const totalRating = ratings.reduce((sum, rating) => sum + rating, 0);
          setSellerRating((totalRating / ratings.length).toFixed(1));
        }
      } catch (error) {
        console.error("Error al cargar los productos del vendedor:", error);
      }
    };

    fetchSellerData();
    fetchSellerProducts();
  }, [sellerId]);

  const renderItem = ({ item }) => {
    if (item.cantidad <= 0 || !item.statusView) {
      return null; // No renderiza este item si la cantidad es 0 o si statusView es falso
    }
  
    return (
      <MainProductCard 
        product={item} 
        navigation={navigation} 
      />
    );
  };
  
  if (!seller) {
    return <Text>Cargando...</Text>;
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
        <Image source={{ uri: seller.foto || 'path/to/default/image' }} style={styles.profileImage} />
      </View>
      <CustomText style={styles.sellerName} fontWeight='SemiBold'>{seller.nombre}</CustomText>
      <CustomText style={styles.selfInfo} fontWeight='SemiBold'>Sobre de mí</CustomText>
      <CustomText style={styles.sellerInfo}>
        {seller.descripcionUsuario || 'Sin descripción disponible.'}
      </CustomText>
      <View style={styles.detailsContainer}>
        <View style={styles.detailItem}>
          <View style={styles.ratingContainer}>
            <CustomText style={styles.ratingText}>{sellerRating}</CustomText>
            <Icon name="star" size={19} color="#FF6347" style={styles.starIcon} />
          </View>
          <CustomText style={styles.detailLabel} fontWeight='Medium'>Calificación</CustomText>
        </View>
        <View style={styles.detailItem}>
          <CustomText style={styles.monthsText}>{timeInApp}</CustomText>
          <CustomText style={styles.detailLabel} fontWeight='Medium'>{timeMeasure}</CustomText>
        </View>
      </View>
      <View style={styles.separator} />
      <CustomText style={styles.allProductsText} fontWeight='SemiBold'>Productos</CustomText>
      {sellerProducts.length === 0 ? (
        <CustomText style={styles.noProductsText}>No hay productos para mostrar.</CustomText>
      ) : (
        <FlatList
          data={sellerProducts}
          renderItem={renderItem}
          keyExtractor={item => item.id.toString()}
          numColumns={2}
          contentContainerStyle={[styles.productList, { paddingBottom: 80 }]} // Ajuste aquí
        />
      )}
      <BottomMenuBar />
    </View>
  );
};

const { width, height } = Dimensions.get('window');
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    paddingBottom: height * .06,

  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: 125,
  },
  backgroundImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'fill',
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
  selfInfo: {

    marginLeft: 30,
    fontSize: 17,
    marginTop: 15,

  },
  sellerName: {
    fontSize: 20,
    paddingTop: 15,
    alignSelf: 'center'
  },
  sellerInfo: {
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
  separator: {
    height: .5,
    backgroundColor: '#C1C1C1',
    width: '85%',
    alignSelf: 'center',
  },
  productList: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 4,
  },
});

export default InfoSeller;
