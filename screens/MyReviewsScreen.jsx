import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, ScrollView, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { auth, db } from '../services/firebaseConfig';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';

import TopBar from '../components/TopBar';
import BottomMenuBar from '../components/BottomMenuBar';
import BackButton from '../components/BackButton';
import StarRating from '../components/StarRating';

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
          <BackButton onPress={() => navigation.goBack()} />
          <Text style={styles.title}>Reseñas</Text>
        </View>
        <Text style={styles.loadingText}>Cargando reseñas...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TopBar />
      <View style={styles.headerContainer}>
        <BackButton onPress={() => navigation.goBack()} />
        <Text style={styles.title}>Reseñas</Text>
      </View>
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        {reviews.map((review, index) => (
          <View key={index} style={styles.reviewItem}>
            <View style={styles.productInfo}>
              <Image source={{ uri: review.producto.imagen }} style={styles.productImage} />
              <Text style={styles.productName}>{review.producto.nombre}</Text>
            </View>
            <View style={styles.reviewHeader}>
              <StarRating
                maxStars={5}
                rating={review.calificacionResena}
                onStarPress={() => {}}
                starSize={15}
              />
              <Text style={styles.reviewDate}>
                {review.fechaResena ? review.fechaResena.toLocaleDateString() : 'Fecha desconocida'}
              </Text>
            </View>
            <View style={styles.commentSeparator} />

            <Text style={styles.reviewText}>{review.comentario}</Text>
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
    fontSize: 22,
    fontWeight: 'bold',
    color: '#030A8C',
    marginLeft: 10,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 10,
    marginBottom: 12,
  },
  scrollViewContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  loadingText: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 20,
    color: '#666',
  },
  reviewItem: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
    borderColor: '#ddd',
    borderWidth: 1,
  },
  productInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  productImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  productName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  reviewDate: {
    fontSize: 12,
    color: '#666',
  },
  reviewText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 20,
  },
  commentSeparator: {
    borderBottomColor: '#ccc',
    borderBottomWidth: 1,
    marginBottom: 10,
  },
  bottomPadding: {
    height: 80,
  },
});

export default MyReviewsScreen;
