import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, FlatList, TouchableOpacity } from 'react-native';
import SearchBar from '../components/SearchBar';
import BackButton from '../components/BackButton';
import BottomMenuBar from '../components/BottomMenuBar';
import Icon from 'react-native-vector-icons/FontAwesome';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../services/firebaseConfig';

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
    return (
      <TouchableOpacity
        style={styles.productItem}
        onPress={() => navigation.navigate('ProductScreen', { productId: item.id, isFavorite: false })}
      >
        <Image source={{ uri: item.imagen }} style={[styles.productImage, { alignSelf: 'center' }]} />
        <View style={styles.productInfo}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={styles.productName}>{item.nombre}</Text>
            <Text style={styles.productPrice}>${item.precio}.00</Text>
          </View>
          <Text style={styles.productUnits}>Unidades: {item.cantidad}</Text>
        </View>
      </TouchableOpacity>
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
      <Text style={styles.sellerName}>{seller.nombre}</Text>
      <Text style={styles.sellerInfo}>
        {seller.descripcionUsuario || 'Sin descripción disponible.'}
      </Text>
      <View style={styles.detailsContainer}>
        <View style={styles.detailItem}>
          <View style={styles.ratingContainer}>
            <Text style={styles.ratingText}>{sellerRating}</Text>
            <Icon name="star" size={19} color="#030A8C" style={styles.starIcon} />
          </View>
          <Text style={styles.detailLabel}>Calificación</Text>
        </View>
        <View style={styles.detailItem}>
          <Text style={styles.monthsText}>{timeInApp}</Text>
          <Text style={styles.detailLabel}>{timeMeasure}</Text>
        </View>
      </View>
      <Text style={styles.allProductsText}>Productos</Text>
      {sellerProducts.length === 0 ? (
        <Text style={styles.noProductsText}>No hay productos para mostrar.</Text>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 20,
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
    borderRadius: 60,
    borderWidth: 2,
    borderColor: '#030A8C',
  },
  sellerName: {
    fontSize: 25,
    paddingTop: 15,
    paddingLeft: 30,
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
    fontSize: 20,
    marginLeft: 30,
    marginTop: 20,
    fontWeight: 'bold',
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
  productItem: {
    flex: 1,
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    margin: 5,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 4,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    borderWidth: .5,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    paddingTop: 8
  },
  productImage: {
    width: '100%',
    height: 80,
    resizeMode: 'contain',
    borderRadius: 10,
  },
  productInfo: {
    flex: 1,
    marginLeft: 5,
  },
  productName: {
    flex: 1,
    fontSize: 13,
    fontWeight: 'bold',
    marginLeft: 2,
    textAlign: 'left',
  },
  productPrice: {
    fontSize: 11,
    fontWeight: 'bold',
    marginRight: 3,
    color: '#030A8C',
    textAlign: 'right',
  },
  productUnits: {
    fontSize: 12,
    marginLeft: 2,
    marginBottom: 3,
    color: '#666',
  },
  favoriteIcon: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
});

export default InfoSeller;
