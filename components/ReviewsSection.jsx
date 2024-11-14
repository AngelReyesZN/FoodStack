import React from 'react';
import { View, Text, Image, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import StarRating from './StarRating';
import CustomText from '../components/CustomText';
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
      <CustomText style={styles.reviewCount} fontWeight='Bold'>{reviews.length} Reseñas</CustomText>
      <View style={styles.fixedStars}>
        {Array.from({ length: 5 }, (_, index) => (
          <Icon key={index} name="star" size={30} color={index < averageRating ? "#FF6347" : "#ccc"} style={styles.starIcon} />
        ))}
      </View>
      <View style={styles.reviewContainer}>
        <CustomText style={styles.reviewLabel} fontWeight='Regular'>Tu reseña</CustomText>
        <TextInput
          style={styles.reviewInput}
          value={review}
          onChangeText={setReview}
          multiline
          textAlignVertical="top"
        />
      </View>
      <CustomText style={styles.generalRatingLabel}>Tu calificación</CustomText>
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
              <CustomText style={styles.userName} fontWeight='SemiBold'>{rev.usuario.nombre}</CustomText>
            </View>
            <View style={styles.reviewHeader}>
              <StarRating
                maxStars={5}
                rating={rev.calificacionResena}
                onStarPress={() => {}}
                starSize={15}
              />
              <CustomText style={styles.reviewDate}>
                {rev.fechaResena ? rev.fechaResena.toLocaleDateString() : 'Fecha desconocida'}
              </CustomText>
            </View>
            <CustomText style={styles.reviewText}>{rev.comentario}</CustomText>
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
    backgroundColor: '#FF6347',
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
  },
});

export default ReviewsSection;
