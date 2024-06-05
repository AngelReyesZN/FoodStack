import React from 'react';
import { View, Text, Image, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import StarRating from './StarRating';
import Icon from 'react-native-vector-icons/FontAwesome';

const ReviewsSection = ({
  reviews,
  review,
  setReview,
  rating,
  setRating,
  addReview,
  averageRating,
  keyboardVisible
}) => {
  return (
    <View style={styles.reviewsContainer}>
      <View style={styles.separatorReviews} />
      <Text style={styles.reviewCount}>{reviews.length} Reseñas</Text>
      <View style={styles.fixedStars}>
        {Array.from({ length: 5 }, (_, index) => (
          <Icon key={index} name="star" size={30} color={index < averageRating ? "#030A8C" : "#ccc"} style={styles.starIcon} />
        ))}
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
      {!keyboardVisible && <View style={styles.bottomPadding} />}
    </View>
  );
};

const styles = StyleSheet.create({
  reviewsContainer: {
    padding: 10,
  },
  separatorReviews: {
    marginTop: 30,
    borderBottomColor: '#ccc',
    borderBottomWidth: 1,
    marginVertical: 10,
    marginHorizontal: 30,
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
  starIcon: {
    marginTop: 1,
    marginHorizontal: 5,
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
});

export default ReviewsSection;
