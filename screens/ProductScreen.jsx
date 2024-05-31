import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Linking, Alert, TextInput, ScrollView, KeyboardAvoidingView, Platform, Keyboard } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import SearchBar from '../components/SearchBar';
import BottomMenuBar from '../components/BottomMenuBar';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useNavigation } from '@react-navigation/native';
import BackButton from '../components/BackButton.jsx';
import StarRating from '../components/StarRating';
import { db, auth } from '../services/firebaseConfig';
import { collection, query, where, getDocs, doc, getDoc, setDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';

const ProductScreen = ({ route }) => {
  const { productId, isFavorite: initialIsFavorite } = route.params;
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(initialIsFavorite);
  const [review, setReview] = useState('');
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(0);
  const [averageRating, setAverageRating] = useState(0);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const navigation = useNavigation();
  const currentUserEmail = auth.currentUser.email;

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const productDoc = await getDoc(doc(db, 'productos', productId));
        if (productDoc.exists()) {
          const productData = productDoc.data();
          const vendorDoc = await getDoc(productData.vendedorRef);
          const vendorData = vendorDoc.exists() ? vendorDoc.data() : null;
          setProduct({ ...productData, vendedor: vendorData });

          // Verificar si el producto es favorito
          const userQuery = query(collection(db, 'usuarios'), where('correo', '==', auth.currentUser.email));
          const userSnapshot = await getDocs(userQuery);
          if (!userSnapshot.empty) {
            const userDoc = userSnapshot.docs[0];
            const favRefs = userDoc.data().favoritos || [];
            const isFav = favRefs.some(ref => ref.id === productId);
            setIsFavorite(isFav);
          }
        } else {
          console.error("Producto no encontrado");
        }
      } catch (error) {
        console.error("Error al cargar el producto:", error);
      }
    };

    fetchProduct();
  }, [productId]);

  useEffect(() => {
    const loadReviews = async () => {
      try {
        const reviewsRef = collection(db, 'resenas');
        const productRef = doc(db, `productos/${productId}`);
        const q = query(reviewsRef, where('productoRef', '==', productRef));
        const reviewsSnapshot = await getDocs(q);
        const loadedReviews = await Promise.all(reviewsSnapshot.docs.map(async reviewDoc => {
          const reviewData = reviewDoc.data();
          const userDocRef = doc(db, reviewData.usuarioRef.path ? reviewData.usuarioRef.path : reviewData.usuarioRef);
          const userDoc = await getDoc(userDocRef);
          const userData = userDoc.exists() ? userDoc.data() : {};
          
          return {
            ...reviewData,
            fechaResena: reviewData.fechaResena ? reviewData.fechaResena.toDate() : null,
            usuario: userData
          };
        }));
        setReviews(loadedReviews);
        calculateAverageRating(loadedReviews);
      } catch (error) {
        console.error('Error loading reviews:', error);
      }
    };

    loadReviews();
  }, [productId]);

  const calculateAverageRating = (reviews) => {
    if (reviews.length === 0) {
      setAverageRating(0);
      return;
    }
    const totalRating = reviews.reduce((sum, review) => sum + review.calificacionResena, 0);
    setAverageRating(totalRating / reviews.length);
  };

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const increaseQuantity = () => {
    setQuantity(quantity + 1);
  };

  const toggleFavorite = async () => {
    try {
      const userQuery = query(collection(db, 'usuarios'), where('correo', '==', auth.currentUser.email));
      const userSnapshot = await getDocs(userQuery);
      if (!userSnapshot.empty) {
        const userDocRef = userSnapshot.docs[0].ref;

        if (isFavorite) {
          await updateDoc(userDocRef, {
            favoritos: arrayRemove(doc(db, 'productos', productId))
          });
        } else {
          await updateDoc(userDocRef, {
            favoritos: arrayUnion(doc(db, 'productos', productId))
          });
        }
        setIsFavorite(!isFavorite);
      } else {
        console.error('Usuario no encontrado');
      }
    } catch (error) {
      console.error('Error al actualizar favoritos:', error);
    }
  };

  const navigateToSellerInfo = () => {
    navigation.navigate('InfoSeller', { sellerId: product.vendedorRef.id });
  };

  const handleWhatsApp = () => {
    const phoneNumber = product.vendedor?.telefono;
    if (phoneNumber) {
      const url = `whatsapp://send?phone=${phoneNumber}`;
      Linking.openURL(url)
        .catch(() => {
          Alert.alert('Error', 'No se pudo abrir WhatsApp. Asegúrate de que esté instalado.');
        });
    } else {
      Alert.alert('Error', 'Número de teléfono no disponible.');
    }
  };

  const addReview = async () => {
    if (review.trim() && rating > 0) {
      try {
        const userQuery = query(collection(db, 'usuarios'), where('correo', '==', currentUserEmail));
        const userSnapshot = await getDocs(userQuery);
        if (!userSnapshot.empty) {
          const userRef = userSnapshot.docs[0].ref;
          
          const reviewsSnapshot = await getDocs(collection(db, 'resenas'));
          const newReviewId = `resena${reviewsSnapshot.size + 1}`;

          const newReview = {
            comentario: review,
            calificacionResena: rating,
            fechaResena: new Date(),
            productoRef: doc(db, `productos/${productId}`),
            usuarioRef: userRef
          };

          await setDoc(doc(db, 'resenas', newReviewId), newReview);
          setReviews([...reviews, { ...newReview, usuario: userSnapshot.docs[0].data() }]);
          setReview('');
          setRating(0);
          calculateAverageRating([...reviews, { ...newReview, usuario: userSnapshot.docs[0].data() }]);
        } else {
          console.error('Usuario no encontrado');
        }
      } catch (error) {
        console.error('Error adding review:', error);
      }
    }
  };

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => {
      setKeyboardVisible(true);
    });
    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardVisible(false);
    });

    return () => {
      keyboardDidHideListener.remove();
      keyboardDidShowListener.remove();
    };
  }, []);

  if (!product) {
    return <Text>Cargando...</Text>;
  }

  return (
    <KeyboardAvoidingView 
      style={[styles.container, { paddingBottom: keyboardVisible ? 0 : 20 }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <SearchBar />
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <BackButton />
        </TouchableOpacity>
        <Text style={styles.category}>{product.categoria}</Text>
        <Text style={styles.name}>{product.nombre}</Text>
        <Image source={{ uri: product.imagen }} style={styles.image} />
        <View style={styles.sellerContainer}>
          <TouchableOpacity onPress={navigateToSellerInfo}>
            <Image source={{ uri: product.vendedor?.foto || 'path/to/default/image' }} style={styles.sellerImage} />
          </TouchableOpacity>
          <View style={styles.sellerInfoContainer}>
          <TouchableOpacity onPress={navigateToSellerInfo}>
            <Text style={styles.sellerName}>{product.vendedor?.nombre || 'Vendedor desconocido'}</Text>
          </TouchableOpacity>

            <View style={styles.ratingContainer}>
              <Text style={styles.ratingText}>4.5</Text>
              <Icon name="star" size={18} color="#030A8C" style={styles.starIcon} />
            </View>
          </View>
        </View>
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={decreaseQuantity}>
            <Image source={require('../assets/rscMenu/disminuir.png')} style={styles.buttonIcon} />
          </TouchableOpacity>
          <Text style={styles.quantity}>{quantity}</Text>
          <TouchableOpacity style={styles.button} onPress={increaseQuantity}>
            <Image source={require('../assets/rscMenu/aumentar.png')} style={styles.buttonIcon} />
          </TouchableOpacity>
          <Text style={styles.price}>${product.precio}.00</Text>
        </View>
        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.imageButton} onPress={handleWhatsApp}>
            <Image source={require('../assets/rscMenu/whatsapp.png')} style={styles.imageButtonIcon} />
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
        <View style={styles.separatorReviews} />
        <View style={styles.containerDescription}>
          <Text style={styles.TextDescription}>Descripción</Text>
          <Text style={styles.description}>{product.descripcion}</Text>
        </View>
        <View style={styles.reviewsGeneral}>
          <View style={styles.separatorReviews} />
          <Text style={styles.reviewCount}>{reviews.length} Reseñas</Text>
          <View style={styles.fixedStars}>
            {Array.from({ length: 5 }, (_, index) => (
              <Icon key={index} name="star" size={30} color={index < averageRating ? "#030A8C" : "#ccc"} style={styles.starIcon} />
            ))}
          </View>
        </View>
        <View style={styles.reviewContainer}>
          <Text style={styles.reviewLabel}>Tu reseña</Text>
          <TextInput
            style={styles.reviewInput}
            value={review}
            onChangeText={setReview}
            multiline
            textAlignVertical="top"
          />
        </View>
        <Text style={styles.generalRatingLabel}>Tu calificación</Text>
        <View style={styles.ratingAndButtonContainer}>
          <View style={styles.starsAndButton}>
            <View style={{ marginLeft: 30 }}>
              <StarRating
                maxStars={5}
                rating={rating}
                onStarPress={(rating) => setRating(rating)}
              />
            </View>
            <TouchableOpacity style={styles.publishButton} onPress={addReview}>
              <Text style={styles.publishButtonText}>Publicar</Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.separator} />
        <View style={styles.reviewsList}>
          {reviews.map((rev, index) => (
            <View key={index} style={styles.reviewItem}>
              <View style={styles.userHeader}>
                <Image source={{ uri: rev.usuario.foto }} style={styles.userImage} />
                <Text style={styles.userName}>{rev.usuario.nombre}</Text>
              </View>
              <View style={styles.reviewHeader}>
                <StarRating
                  maxStars={5}
                  rating={rev.calificacionResena}
                  onStarPress={() => {}}
                  starSize={15}
                />
                <Text style={styles.reviewDate}>
                  {rev.fechaResena ? rev.fechaResena.toLocaleDateString() : 'Fecha desconocida'}
                </Text>
              </View>
              <Text style={styles.reviewText}>{rev.comentario}</Text>
              <View style={styles.commentSeparator} />
            </View>
          ))}
        </View>
        <View style={styles.bottomPadding} />
      </ScrollView>
      {!keyboardVisible && <BottomMenuBar />}
    </KeyboardAvoidingView>
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
  scrollViewContent: {
    paddingBottom: 20,
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
  sellerInfoContainer: {
    flexDirection: 'row',
    flex: 1,
  },
  sellerName: {
    fontSize: 20,
    textDecorationLine: 'underline',
    flexShrink: 1,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 40,
  },
  ratingText: {
    fontSize: 20,
  },
  starIcon: {
    marginTop: 1,
    marginHorizontal: 5,
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
  reviewCount: {
    fontSize: 20,
    textAlign: 'center',
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 5,
  },
  fixedStars: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 10,
  },
  generalRatingLabel: {
    fontSize: 18,
    marginLeft: 30,
    textAlign: 'justify',
    marginBottom: 5,
  },
  ratingAndButtonContainer: {
    marginTop: 10,
    flexDirection: 'row',
    marginBottom: 10,
    alignItems: 'center',
  },
  starsAndButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  publishButton: {
    backgroundColor: '#030A8C',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
    marginLeft: 40,
  },
  publishButtonText: {
    color: 'white',
    fontSize: 16,
  },
  separator: {
    borderBottomColor: '#ccc',
    borderBottomWidth: 1,
    marginVertical: 10,
    marginHorizontal: 30,
  },
  separatorReviews: {
    marginTop: 30,
    borderBottomColor: '#ccc',
    borderBottomWidth: 1,
    marginVertical: 10,
    marginHorizontal: 30,
  },
  starRating: {
    marginBottom: 10,
  },
  starRatingReview: {
    marginTop: 5,
  },
  reviewContainer: {
    padding: 5,
    backgroundColor: 'white',
    borderRadius: 10,
    marginVertical: 10,
    marginHorizontal: 20,
  },
  reviewLabel: {
    fontSize: 18,
    paddingBottom: 10,
  },
  reviewInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    paddingHorizontal: 8,
    height: 110,
    borderRadius: 5,
    marginBottom: 10,
    textAlignVertical: 'top',
  },
  reviewsList: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  reviewItem: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
    borderColor: '#ddd',
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  reviewDate: {
    fontSize: 12,
    color: '#666',
  },
  bottomPadding: {
    height: 80,
  },
  commentSeparator: {
    borderBottomColor: '#ccc',
    borderBottomWidth: 1,
    marginTop: 30,
  },
  reviewText: {
    fontSize: 18,
    paddingLeft: 5,
    color: '#333',
    lineHeight: 20,
  },
  containerDescription: {
    paddingLeft: 30,
    paddingRight: 30,
  },
  TextDescription: {
    fontSize: 25,
    textAlign: 'center',
    fontWeight: 'bold',
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    textAlign: 'justify',
  },
  userHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  userImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  reviewDate: {
    fontSize: 12,
    color: '#666',
  },
});

export default ProductScreen;