import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, Image, TouchableOpacity, Linking } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { getDoc, doc, getDocs, query, collection, where } from 'firebase/firestore';
import { db } from '../services/firebaseConfig';
import { useNavigation } from '@react-navigation/native';

const ModalProductDetails = ({ visible, product, onClose, onAddToFavorites, onAddToCart }) => {
  const [vendedor, setVendedor] = useState(null);
  const [vendedorRating, setVendedorRating] = useState('-');
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchVendedor = async () => {
      if (product && product.vendedorRef) {
        const vendedorDoc = await getDoc(doc(db, product.vendedorRef.path));
        if (vendedorDoc.exists()) {
          const vendedorData = vendedorDoc.data();
          setVendedor(vendedorData);
          fetchVendedorRating(vendedorDoc.id);
        }
      }
    };

    const fetchVendedorRating = async (vendedorId) => {
      try {
        const q = query(collection(db, 'productos'), where('vendedorRef', '==', doc(db, 'usuarios', vendedorId)));
        const querySnapshot = await getDocs(q);
        const products = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        const productRefs = products.map(product => doc(db, 'productos', product.id));
        const reviewsQuery = query(collection(db, 'resenas'), where('productoRef', 'in', productRefs));
        const reviewsSnapshot = await getDocs(reviewsQuery);
        const reviews = reviewsSnapshot.docs.map(doc => doc.data());
        const ratings = reviews.map(review => review.calificacionResena);

        if (ratings.length > 0) {
          const totalRating = ratings.reduce((sum, rating) => sum + rating, 0);
          setVendedorRating((totalRating / ratings.length).toFixed(1));
        }
      } catch (error) {
        console.error('Error fetching vendedor rating:', error);
      }
    };

    fetchVendedor();
  }, [product]);

  const handleWhatsAppPress = () => {
    if (vendedor && vendedor.telefono) {
      Linking.openURL(`https://wa.me/${vendedor.telefono}`);
    }
  };

  const handleFavoritePress = () => {
    setIsFavorite(!isFavorite);
    if (onAddToFavorites) {
      onAddToFavorites(product);
    }
  };

  const handleAddToCart = () => {
    if (onAddToCart) {
      onAddToCart({ ...product, quantity });
    }
    onClose();
  };

  const incrementQuantity = () => {
    setQuantity(quantity + 1);
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const navigateToSellerInfo = () => {
    navigation.navigate('InfoSeller', { sellerId: product.vendedorRef.id });
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          {product && (
            <>
              <View style={styles.imageContainer}>
                <Image source={{ uri: product.imagen }} style={styles.image} />
                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                  <Icon name="times" size={16} color="grey" />
                </TouchableOpacity>
              </View>
              <View style={styles.productDetailsContainer}>
                <View style={styles.headerContainer}>
                  <Text style={styles.category}>{product.categoria}</Text>
                  <TouchableOpacity
                    onPress={handleFavoritePress}
                    style={[
                      styles.favoriteButton,
                      isFavorite ? styles.favoriteButtonSelected : styles.favoriteButtonUnselected
                    ]}
                  >
                    <Icon name="heart" size={18} color={isFavorite ? 'white' : '#D9D9D9'} />
                  </TouchableOpacity>
                </View>
                <Text style={styles.productName}>{product.nombre}</Text>
                <Text style={styles.productDescription}>{product.descripcion}</Text>
                {vendedor && (
                  <View style={styles.vendedorContainer}>
                    <Image source={{ uri: vendedor.foto }} style={styles.vendedorImage} />

                    <View style={styles.vendedorDetails}>
                      <TouchableOpacity onPress={navigateToSellerInfo}>
                      <Text style={styles.vendedorName}>{vendedor.nombre}</Text>
                      </TouchableOpacity>0
                      <View style={styles.vendedorRating}>
                        <Text>{vendedorRating}</Text>
                        <Icon name="star" size={16} color="#FFD700" />
                      </View>
                    </View>

                    <TouchableOpacity onPress={handleWhatsAppPress} style={styles.whatsappButton}>
                      <Icon name="whatsapp" size={24} color="white" />
                    </TouchableOpacity>
                  </View>
                )}
              </View>
              <View style={styles.footerContainer}>
                <View style={styles.counterContainer}>
                  <TouchableOpacity onPress={decrementQuantity} style={styles.counterButton}>
                    <Icon name="minus" size={16} color="grey" />
                  </TouchableOpacity>
                  <Text style={styles.counterText}>{quantity}</Text>
                  <TouchableOpacity onPress={incrementQuantity} style={styles.counterButton}>
                    <Icon name="plus" size={16} color="grey" />
                  </TouchableOpacity>
                </View>
                <TouchableOpacity style={styles.addToCartButton} onPress={handleAddToCart}>
                  <Text style={styles.addToCartButtonText}>Agregar al carrito</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 0,
  },
  modalContent: {
    width: '90%',
    padding: 0, 
    backgroundColor: 'white',
    borderRadius: 10,
    alignItems: 'center',
    overflow: 'hidden',
  },
  imageContainer: {
    width: '100%',
    height: 300,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DBDBDB',
    borderRadius: 50,
    height: 30,
    width: 30,
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    padding: 0,
  },
  productDetailsContainer: {
    width: '100%',
    padding: 10,
    backgroundColor: 'white',
    borderRadius: 20,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -5 },
    shadowOpacity: 0.90,
    shadowRadius: 3.84,
    elevation: 10,
    marginTop: -20, 
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  category: {
    fontSize: 14,
    color: '#666',
    borderWidth: 1,
    borderColor: '#DBDBDB',
    padding: 5,
    paddingHorizontal: 10,
    textAlign: 'center',
    borderRadius: 50,
  },
  favoriteButton: {
    padding: 5,
    borderRadius: 15,
  },
  favoriteButtonSelected: {
    backgroundColor: '#FF6347',
  },
  favoriteButtonUnselected: {
    backgroundColor: 'white',
    borderColor: '#ccc',
    borderWidth: 1,
  },
  productName: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 10,
  },
  productDescription: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 10,
  },
  vendedorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },
  vendedorImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  vendedorDetails: {
    flex: 1,
  },
  vendedorName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  vendedorRating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  whatsappButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#25D366',
    borderRadius: 5,
    marginTop: 10,
  },
  whatsappText: {
    color: 'white',
    marginLeft: 5,
  },
  footerContainer: {
    width: '100%',
    padding: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    borderColor: '#DBDBDB',
    borderWidth: 1,
    borderRadius: 10,
    marginTop: 0,
  },
  counterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    backgroundColor: '#EAEAEA',
    borderRadius: 10,
    padding: 5,
    paddingHorizontal: 10,
  },
  counterButton: {
    padding: 5,
    borderRadius: 5,
  },
  counterText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginHorizontal: 10,
  },
  addToCartButton: {
    backgroundColor: '#FF6347',
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  addToCartButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default ModalProductDetails;