import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { auth, db } from '../services/firebaseConfig';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';

import TopBar from '../components/TopBar';
import BottomMenuBar from '../components/BottomMenuBar';
import BackButton from '../components/BackButton';
import StarRating from '../components/StarRating';
import CustomText from '../components/CustomText'; // Importa tu componente de texto personalizado

const MyReviewsScreen = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();
  const currentUserEmail = auth.currentUser.email;

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const userQuery = query(collection(db, 'usuarios'), where('correo', '==', currentUserEmail));
        const userSnapshot = await getDocs(userQuery);
        if (!userSnapshot.empty) {
          const userRef = userSnapshot.docs[0].ref;

          const reviewsQuery = query(collection(db, 'resenas'), where('usuarioRef', '==', userRef));
          const reviewsSnapshot = await getDocs(reviewsQuery);
          const loadedReviews = await Promise.all(reviewsSnapshot.docs.map(async reviewDoc => {
            const reviewData = reviewDoc.data();
            const productDoc = await getDoc(reviewData.productoRef);
            const productData = productDoc.exists() ? productDoc.data() : {};

            return {
              ...reviewData,
              producto: productData,
              fechaResena: reviewData.fechaResena ? reviewData.fechaResena.toDate() : null,
            };
          }));
          setReviews(loadedReviews);
        } else {
          console.error('Usuario no encontrado');
        }
      } catch (error) {
        console.error('Error fetching reviews:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [currentUserEmail]);

  if (loading) {
    return (
      <View style={styles.container}>
        <TopBar />
        <View style={styles.headerContainer}>
          <BackButton />
          <CustomText style={styles.title} fontWeight='Semibold'>Reseñas</CustomText>
        </View>
        <CustomText variant="loading" style={styles.loadingText}>Cargando reseñas...</CustomText>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TopBar />
      <View style={styles.headerContainer}>
        <BackButton />
        <CustomText  style={styles.title} fontWeight='Semibold'>Reseñas</CustomText>
      </View>
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        {reviews.map((review, index) => (
          <View key={index} style={styles.reviewItem}>
            <View style={styles.imageContainer}>
              <Image source={{ uri: review.producto.imagen }} style={styles.productImage} />
            </View>
            <View style={styles.reviewDetails}>
              <View style={styles.productInfo}>
                <CustomText variant="subtitle" style={styles.productName}>{review.producto.nombre}</CustomText>
                <View style={styles.rateDateContainer}>
                  <CustomText variant="caption" style={styles.reviewDate}>
                    {review.fechaResena ? review.fechaResena.toLocaleDateString() : 'Fecha desconocida'}
                  </CustomText>
                  <View style={styles.verticalLine} />
                  <StarRating
                    maxStars={5}
                    rating={review.calificacionResena}
                    onStarPress={() => {}}
                    starSize={16}
                    color={'#FF6347'}
                  />
                </View>
              </View>
              <View style={styles.reviewTextContainer}>
                <CustomText variant="body" style={styles.reviewText}>{review.comentario}</CustomText>
              </View>
            </View>
          </View>
        ))}
        <View style={styles.bottomPadding} />
      </ScrollView>
      {!loading && <BottomMenuBar isMenuScreen={true} />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  title: {
    position: 'absolute',
    left: 0,
    right: 0,
    textAlign: 'center',
    fontSize: 24
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginTop: 20,
    marginBottom: 40,
  },
  scrollViewContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 20,
    color: '#666',
  },
  reviewItem: {
    backgroundColor: '#fff',
    padding: 0,
    borderRadius: 10,
    marginBottom: 10,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
    height: 120,
    width: '95%',
  },
  imageContainer: {
    marginRight: 10,
  },
  productImage: {
    width: 120,
    height: 120,
    borderTopLeftRadius: 10, 
    borderBottomLeftRadius: 10, 
  },
  reviewDetails: {
    flex: 1,
  },
  productInfo: {
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  productName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    alignSelf: 'flex-start',
    marginBottom: 5,
  },
  rateDateContainer: {
    flexDirection: 'row',
    alignSelf: 'flex-start',
    alignItems: 'center',
  },
  reviewDate: {
    fontSize: 16,
    color: '#666',
  },
  verticalLine: {
    height: 10,
    width: 1,
    backgroundColor: '#666',
    marginHorizontal: 6,
  },
  reviewText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 20,
    textAlign: 'justify',
  },
  bottomPadding: {
    height: 80,
  },
  reviewTextContainer: {
    flex: 1,
    justifyContent: 'flex-start',
  },
});

export default MyReviewsScreen;