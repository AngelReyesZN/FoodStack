import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, TextInput, ScrollView, KeyboardAvoidingView, Platform, Keyboard, Alert } from 'react-native';
import TopBar from '../components/TopBar';
import BottomMenuBar from '../components/BottomMenuBar';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useNavigation } from '@react-navigation/native';
import BackButton from '../components/BackButton.jsx';
import { db, auth } from '../services/firebaseConfig';
import { collection, query, where, getDocs, doc, getDoc, setDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { agregarNotificacion } from '../services/notifications';
import ReviewsSection from '../components/ReviewsSection';
import CustomText from '../components/CustomText';

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
      setAverageRating("-");
      return;
    }
    const totalRating = reviews.reduce((sum, review) => sum + review.calificacionResena, 0);
    setAverageRating((totalRating / reviews.length).toFixed(1));
  };

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const increaseQuantity = () => {
    if (quantity < product.cantidad) {
      setQuantity(quantity + 1);
    }
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

  const navigateToOrderScreen = async () => {
    if (product.cantidad === 0 || !product.statusView) {
      Alert.alert('Producto no disponible', 'Este producto no está disponible actualmente.');
      return;
    }

    const userQuery = query(collection(db, 'usuarios'), where('correo', '==', auth.currentUser.email));
    const userSnapshot = await getDocs(userQuery);
    if (!userSnapshot.empty) {
      const userDoc = userSnapshot.docs[0];
      if (userDoc.id === product.vendedorRef.id) {
        Alert.alert('No permitido', 'No puedes comprar tu propio producto.');
        return;
      }
    }

    navigation.navigate('Order', { productId: productId, quantity });
  };

  const addReview = async () => {
    if (review.trim() && rating > 0) {
      try {
        const userQuery = query(collection(db, 'usuarios'), where('correo', '==', currentUserEmail));
        const userSnapshot = await getDocs(userQuery);
        if (!userSnapshot.empty) {
          const userRef = userSnapshot.docs[0].ref;

          // Obtener el tamaño actual de la colección 'resenas'
          const reviewsSnapshot = await getDocs(collection(db, 'resenas'));
          const newReviewId = `resena${reviewsSnapshot.size + 1}`;

          const newReview = {
            comentario: review,
            calificacionResena: rating,
            fechaResena: new Date(),
            productoRef: doc(db, `productos/${productId}`),
            usuarioRef: userRef
          };

          // Agregar la nueva reseña con el ID específico
          await setDoc(doc(db, 'resenas', newReviewId), newReview);
          setReviews([...reviews, { ...newReview, usuario: userSnapshot.docs[0].data() }]);
          setReview('');
          setRating(0);
          calculateAverageRating([...reviews, { ...newReview, usuario: userSnapshot.docs[0].data() }]);
          await agregarNotificacion(userRef, 'Añadiste una reseña');
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
      <TopBar />
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <Image source={{ uri: product.imagen }} style={styles.image} />

        <TouchableOpacity style={styles.favoriteButton} onPress={toggleFavorite}>
          <Icon
            name={isFavorite ? 'heart' : 'heart-o'}
            size={27}
            color={isFavorite ? '#FF6347' : '#FF6347'}
            style={[styles.favoriteIcon]}
          />
        </TouchableOpacity>

        {/* aqui va el contendor con border borderRadius */}

        <View style={styles.roudedcontainer}>

          <CustomText style={styles.title} >
            <CustomText style={styles.category} fontWeight="Regular">{product.categoria}</CustomText>
          </CustomText>

          <CustomText style={styles.name} fontWeight='Bold'>{product.nombre}</CustomText>

          <View style={styles.fixedStars}>
            {Array.from({ length: 5 }, (_, index) => (
              <Icon key={index} name="star" size={30} color={index < averageRating ? "#FF6347" : "#ccc"} style={styles.starIcon} />
            ))}
          </View>
          <View style={styles.containerDescription}>
            <CustomText style={styles.TextDescription} fontWeight='Bold'>Descripción</CustomText>
            <CustomText style={styles.description} fontWeight='Medium'>{product.descripcion}</CustomText>
          </View>
          <View style={styles.sellerContainer}>
            <TouchableOpacity onPress={navigateToSellerInfo}>
              <Image source={{ uri: product.vendedor?.foto || 'path/to/default/image' }} style={styles.sellerImage} />
            </TouchableOpacity>
            <View style={styles.sellerInfoContainer}>
              <TouchableOpacity onPress={navigateToSellerInfo}>
                <CustomText
                  style={styles.sellerName}
                  numberOfLines={1} // Limits the text to one line
                  ellipsizeMode="tail" // Adds "..." at the end if the text exceeds the width
                  fontWeight='Medium'
                >
                  {product.vendedor?.nombre || 'Vendedor desconocido'}
                </CustomText>
                <View style={styles.ratingContainer}>
                  <CustomText style={styles.ratingText} fontWeight='Medium'>{averageRating}</CustomText>
                  <Icon name="star" size={18} color="#FF6347" style={styles.starIcon} />
                </View>
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.button} onPress={decreaseQuantity}>
              <Image source={require('../assets/rscMenu/disminuir.png')} style={styles.buttonIcon} />
            </TouchableOpacity>
            <CustomText style={styles.quantity} fontWeight='Bold'>{quantity}</CustomText>
            <TouchableOpacity style={styles.button} onPress={increaseQuantity}>
              <Image source={require('../assets/rscMenu/aumentar.png')} style={styles.buttonIcon} />
            </TouchableOpacity>
            <CustomText style={styles.price} fontWeight='Bold'>${product.precio}.00</CustomText>
          </View>
          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.imageButton} onPress={navigateToOrderScreen}>
              <CustomText style={styles.OrderText} fontWeight='SemiBold'>Ordenar</CustomText>
            </TouchableOpacity>
          </View>
          <ReviewsSection
            reviews={reviews}
            review={review}
            setReview={setReview}
            rating={rating}
            setRating={setRating}
            addReview={addReview}
            averageRating={averageRating}
            keyboardVisible={keyboardVisible}
          />
        </View>
      </ScrollView>
      {!keyboardVisible && <BottomMenuBar />}
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    position: 'relative',
  },
  roudedcontainer: {
    borderRadius: 15, 
    marginTop: -15,
    backgroundColor: 'white',
    elevation: 5,
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
    fontSize: 15,
    textAlign: 'center',
    color: '#8B8B8B',
  },
  name: {
    fontSize: 20,
    textAlign: 'center',
    marginVertical: 10,
  },
  image: {
    width: '100%',
    height: 300, // Increased height to cover more area
    resizeMode: 'cover', // Ensures the image covers its container proportionally
    alignSelf: 'center',
  },
  sellerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginTop: 25,
    paddingLeft: 15,
  },
  sellerImage: {
    width: 60,
    height: 60,
    borderRadius: 10,
    marginRight: 10,
  },
  sellerInfoContainer: {
    flexDirection: 'row',
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sellerName: {
    fontSize: 17,
    textDecorationLine: 'underline',
    flexShrink: 1,
    maxWidth: '80%',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  ratingText: {
    fontSize: 17,
  },
  starIcon: {
    marginHorizontal: 5,
  },
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginVertical: 20,
    alignSelf: 'center',
  },
  button: {
    width: 50,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 0,
    color: '#FF6347',
  },
  buttonIcon: {
    width: 35,
    height: 35,
    color: '#FF6347',
  },
  quantity: {
    fontSize: 20,
    fontWeight: 'bold',
    marginHorizontal: 10,
  },
  price: {
    fontSize: 22,
    color: '#FF6347',
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
    width: '90%',
    height: 40,
    backgroundColor: '#FF6347',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    alignSelf: 'center',
  },
  imageButtonIcon: {
    width: 25,
    height: 25,
  },
  favoriteButton: {
    position: 'absolute',
    top: 40, // Adjust the top value so it aligns better with the category
    right: 15, // Adjust spacing as per your layout needs
    zIndex: 1, // Ensures it stays above other elements
    backgroundColor: '#FFF3F1',
    borderRadius: 50,
    padding: 5,
  },
  favoriteIcon: {
    margin: 3,
  },
  separatorReviews: {
    marginTop: 30,
    borderBottomColor: '#ccc',
    borderBottomWidth: 1,
    marginVertical: 10,
    marginHorizontal: 30,
  },
  containerDescription: {
    alignSelf: 'left',
    paddingHorizontal: 15,
  },
  TextDescription: {
    fontSize: 14,
    textAlign: 'left',
    marginBottom: 10,
  },
  description: {
    fontSize: 14,
    textAlign: 'justify',
  },
  OrderText: {
    color: 'white',
    fontSize: 17,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 15,
  },
  title: {
    fontSize: 24,
    color: '#000',
    textAlign: 'center',
    flex: 1,
    borderWidth: 1,
    borderColor: '#DBDBDB',
    width: '20%',
    padding: 5,
    marginLeft: 10,
    borderRadius: 50,
    marginTop: 10,
  },
  separator: {
    height: 1,
    backgroundColor: '#C1C1C1',
    width: '80%',
    alignSelf: 'center',
    marginTop: 20,
  },
  fixedStars: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
});

export default ProductScreen;
