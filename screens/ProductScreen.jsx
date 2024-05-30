import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Linking, Alert } from 'react-native';
import SearchBar from '../components/SearchBar';
import BottomMenuBar from '../components/BottomMenuBar';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useNavigation } from '@react-navigation/native';
import BackButton from '../components/BackButton.jsx';
import { getDoc, doc } from 'firebase/firestore';
import { db } from '../services/firebaseConfig';

const ProductScreen = ({ route }) => {
  const { productId } = route.params;
  const [product, setProduct] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchProduct = async () => {
      const productDoc = await getDoc(doc(db, 'productos', productId));
      if (productDoc.exists()) {
        const productData = productDoc.data();
        const vendorDoc = await getDoc(doc(db, productData.vendedorRef.path));
        const vendorData = vendorDoc.exists() ? vendorDoc.data() : null;
        setProduct({ ...productData, vendedor: vendorData });
      }
    };

    fetchProduct();
  }, [productId]);

  const decreaseQuantity = () => {
    if (product && product.cantidad > 1) {
      setProduct({ ...product, cantidad: product.cantidad - 1 });
    }
  };

  const increaseQuantity = () => {
    if (product) {
      setProduct({ ...product, cantidad: product.cantidad + 1 });
    }
  };

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
  };

  const handleWhatsApp = () => {
    const phoneNumber = product?.vendedor?.telefono;
    if (phoneNumber) {
      const url = `whatsapp://send?phone=${phoneNumber}`;
      Linking.openURL(url).catch(() => {
        Alert.alert('Error', 'No se pudo abrir WhatsApp. Asegúrate de que esté instalado.');
      });
    } else {
      Alert.alert('Error', 'Número de teléfono no disponible.');
    }
  };

  if (!product) {
    return (
      <View style={styles.container}>
        <Text>Cargando...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SearchBar />
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <BackButton />
      </TouchableOpacity>
      <Text style={styles.category}>{product.categoria}</Text>
      <Text style={styles.name}>{product.nombre}</Text>
      <Image source={{ uri: product.imagen }} style={styles.image} />
      <View style={styles.sellerContainer}>
        <Image source={{ uri: product.vendedor?.foto || 'path/to/default/image' }} style={styles.sellerImage} />
        <View style={styles.sellerInfo}>
          <Text style={styles.sellerName}>{product.vendedor?.nombre || 'Vendedor desconocido'}</Text>
          <View style={styles.ratingContainer}>
            <Text style={styles.ratingText}>4.5</Text>
            <Icon name="star" size={18} color="#030A8C" style={styles.starIcon} />
          </View>
        </View>
      </View>
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={decreaseQuantity}>
          <Image source={require('../assets/rscMenu/BotonMenos.png')} style={styles.buttonIcon} />
        </TouchableOpacity>
        <Text style={styles.quantity}>{product.cantidad}</Text>
        <TouchableOpacity style={styles.button} onPress={increaseQuantity}>
          <Image source={require('../assets/rscMenu/BotonMas.png')} style={styles.buttonIcon} />
        </TouchableOpacity>
        <Text style={styles.price}>${product.precio}.00</Text>
      </View>
      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.imageButton} onPress={handleWhatsApp}>
          <Image source={require('../assets/rscMenu/BotonImagen.png')} style={styles.imageButtonIcon} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.favoriteButton} onPress={toggleFavorite}>
          <Icon
            name={isFavorite ? 'heart' : 'heart-o'}
            size={27}
            color={isFavorite ? '#e82d2d' : '#030A8C'}
            style={[styles.favoriteIcon]}
          />
        </TouchableOpacity>
      </View>
      <BottomMenuBar />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 20,
    backgroundColor: 'white',
    position: 'relative',
  },
  backButton: {
    marginRight: 10,
    paddingTop: 10,
    paddingLeft: 15,
  },
  category: {
    fontSize: 22,
    textAlign: 'center',
    marginTop: 10,
    color: '#030A8C',
  },
  name: {
    fontSize: 30,
    textAlign: 'center',
    marginVertical: 10,
  },
  image: {
    width: '100%',
    height: 300,
    resizeMode: 'contain',
    alignSelf: 'center',
  },
  sellerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginVertical: 20,
    paddingLeft: 30,
  },
  sellerImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  sellerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sellerName: {
    fontSize: 20,
    textDecorationLine: 'underline',
    marginRight: 15,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 20,
    marginRight: 5,
  },
  starIcon: {
    marginTop: 1,
  },
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginVertical: 10,
    paddingLeft: 30,
  },
  button: {
    width: 50,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 0,
  },
  buttonIcon: {
    width: 35,
    height: 35,
  },
  quantity: {
    fontSize: 20,
    fontWeight: 'bold',
    marginHorizontal: 10,
  },
  price: {
    fontSize: 22,
    color: '#030A8C',
    marginLeft: 120,
  },
  units: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    marginVertical: 5,
  },
  description: {
    fontSize: 16,
    color: '#444',
    textAlign: 'center',
    marginVertical: 10,
  },
  imageButton: {
    width: '70%',
    height: 40,
    backgroundColor: '#030A8C',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    marginLeft: 30,
  },
  imageButtonIcon: {
    width: 25,
    height: 25,
  },
  favoriteButton: {
    position: 'absolute',
    top: 3,
    right: 45,
    borderWidth: 1,
    borderColor: '#D6DBDE',
    borderRadius: 6,
  },
  favoriteIcon: {
    margin: 3,
  },
});

export default ProductScreen;
