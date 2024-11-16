import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import CustomText from '../components/CustomText';
import Icon from 'react-native-vector-icons/FontAwesome';
import { db, auth } from '../services/firebaseConfig';
import { doc, getDocs, updateDoc, query, where, collection, arrayUnion, arrayRemove } from 'firebase/firestore';

const MainProductCard = ({ product, navigation }) => {
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const userQuery = query(collection(db, 'usuarios'), where('correo', '==', auth.currentUser.email));
        const userSnapshot = await getDocs(userQuery);
        if (!userSnapshot.empty) {
          const userDoc = userSnapshot.docs[0];
          const favRefs = userDoc.data().favoritos || [];
          const isFav = favRefs.some(ref => ref.id === product.id);
          setIsFavorite(isFav);
        }
      } catch (error) {
        console.error('Error fetching favorites:', error);
      }
    };

    fetchFavorites();
  }, [product.id]);

  const toggleFavorite = async () => {
    try {
      const userQuery = query(collection(db, 'usuarios'), where('correo', '==', auth.currentUser.email));
      const userSnapshot = await getDocs(userQuery);
      if (!userSnapshot.empty) {
        const userDocRef = userSnapshot.docs[0].ref;

        if (isFavorite) {
          await updateDoc(userDocRef, {
            favoritos: arrayRemove(doc(db, 'productos', product.id))
          });
        } else {
          await updateDoc(userDocRef, {
            favoritos: arrayUnion(doc(db, 'productos', product.id))
          });
        }
        setIsFavorite(!isFavorite);
      } else {
        console.error('User not found');
      }
    } catch (error) {
      console.error('Error updating favorites:', error);
    }
  };

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('ProductScreen', { productId: product.id })}
    >
      <View style={styles.imageContainer}>
        <Image source={{ uri: product.imagen }} style={styles.image} />
        <TouchableOpacity
          onPress={toggleFavorite}
          style={[
            styles.favoriteButton,
            isFavorite ? styles.favoriteButtonSelected : styles.favoriteButtonUnselected
          ]}
        >
          <Icon name="heart" size={18} color={isFavorite ? 'white' : '#D9D9D9'} />
        </TouchableOpacity>
      </View>
      <View style={styles.detailsContainer}>
        <CustomText style={styles.title} fontWeight="Bold">
          {product.nombre.length > 14 ? product.nombre.substring(0, 14) : product.nombre}
        </CustomText>
        <CustomText style={styles.descripcion}>
          {product.descripcion.substring(0, 14)}
          {product.descripcion.length > 14 ? '...' : ''}
        </CustomText>
      </View>
      <View style={styles.bottomContainer}>
        <CustomText style={styles.price} fontWeight='Medium'>${product.precio}</CustomText>
        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('ProductScreen', { productId: product.id })}>
          <CustomText style={styles.buttonText} fontWeight='Medium'>Detalles</CustomText>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 0,
    paddingTop: 0,
    margin: 10,
    alignItems: 'flex-start',
    width: '45%',
    height: 260,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    overflow: 'hidden',
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
  },
  image: {
    width: '100%',
    height: 150,
    resizeMode: 'cover',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  title: {
    fontSize: 16,
    marginTop: 4,
  },
  price: {
    color: '#FF6347',
    fontSize: 16,
  },
  descripcion: {
    fontSize: 12,
    marginTop: 4,
  },
  button: {
    backgroundColor: '#FF6347',
    padding: 10,
    paddingHorizontal: 15,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 14,
    color: 'white',
  },
  detailsContainer: {
    padding: 10,
    paddingTop: 4,
    alignItems: 'flex-start',
  },
  bottomContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 10,
    marginTop: 4,
  },
  favoriteButton: {
    position: 'absolute',
    padding: 5,
    borderRadius: 50,
    top: 10,
    right: 10,
  },
  favoriteButtonSelected: {
    backgroundColor: '#FF6347',
  },
  favoriteButtonUnselected: {
    backgroundColor: 'white',
    borderColor: '#ccc',
    borderWidth: 1,
  },
});

export default MainProductCard;