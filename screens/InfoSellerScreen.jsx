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
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    const fetchSellerData = async () => {
      try {
        const sellerDoc = await getDoc(doc(db, 'usuarios', sellerId));
        if (sellerDoc.exists()) {
          setSeller(sellerDoc.data());
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
        const products = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setSellerProducts(products);
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
        onPress={() => navigation.navigate('ProductScreen', { productId: item.id, isFavorite })}
      >
        <Image source={{ uri: item.imagen }} style={[styles.productImage, { alignSelf: 'center' }]} />
        <View style={styles.productInfo}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={styles.productName}>{item.nombre}</Text>
            <Text style={styles.productPrice}>Precio: ${item.precio}.00</Text>
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
            <Text style={styles.ratingText}>4.5</Text>
            <Icon name="star" size={19} color="#030A8C" style={styles.starIcon} />
          </View>
          <Text style={styles.detailLabel}>Calificación</Text>
        </View>
        <View style={styles.detailItem}>
          <Text style={styles.monthsText}>12</Text>
          <Text style={styles.detailLabel}>Meses</Text>
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
    backgroundColor: '#f5f5f5',
    margin: 5,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 10,
    marginTop: 5,
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
