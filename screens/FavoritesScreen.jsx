import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { db, auth } from '../services/firebaseConfig';
import { doc, getDoc, getDocs, query, where, collection, updateDoc, arrayRemove } from 'firebase/firestore';
import TopBar from '../components/TopBar';
import BottomMenuBar from '../components/BottomMenuBar';
import BackButton from '../components/BackButton';

const FavoritesScreen = () => {
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const userQuery = query(collection(db, 'usuarios'), where('correo', '==', auth.currentUser.email));
        const userSnapshot = await getDocs(userQuery);
        if (!userSnapshot.empty) {
          const userDoc = userSnapshot.docs[0];
          const favRefs = userDoc.data().favoritos || [];
          const favs = await Promise.all(favRefs.map(async (ref) => {
            const productDoc = await getDoc(ref);
            return { id: ref.id, ...productDoc.data() };
          }));
          setFavorites(favs);
        }
      } catch (error) {
        console.error('Error al cargar favoritos:', error);
      }
    };

    fetchFavorites();
  }, []);

  const renderItem = ({ item }) => (
    <View style={styles.productItem}>
      <Image source={{ uri: item.imagen }} style={styles.productImage} />
      <View style={styles.productInfo}>
        <Text style={styles.productName}>{item.nombre}</Text>
        <Text style={styles.productPrice}>${item.precio}.00</Text>
      </View>
      <TouchableOpacity onPress={() => removeFromFavorites(item.id)}>
        <Text style={styles.removeButton}>Eliminar</Text>
      </TouchableOpacity>
    </View>
  );

  const removeFromFavorites = async (productId) => {
    try {
      const userQuery = query(collection(db, 'usuarios'), where('correo', '==', auth.currentUser.email));
      const userSnapshot = await getDocs(userQuery);
      if (!userSnapshot.empty) {
        const userDocRef = userSnapshot.docs[0].ref;
        await updateDoc(userDocRef, {
          favoritos: arrayRemove(doc(db, 'productos', productId))
        });
        setFavorites(favorites.filter(fav => fav.id !== productId));
      } else {
        console.error('Usuario no encontrado');
      }
    } catch (error) {
      console.error('Error al eliminar de favoritos:', error);
    }
  };

  return (
    <View style={styles.container}>
      <TopBar />
      <View style={styles.headerContainer}>
        <BackButton />
        <Text style={styles.title}>Favoritos</Text>
      </View>
      {favorites.length === 0 ? (
        <Text style={styles.noFavoritesText}>No tienes productos favoritos aún.</Text>
      ) : (
        <FlatList
          data={favorites}
          renderItem={renderItem}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.productList}
        />
      )}
      <BottomMenuBar isMenuScreen={true} />
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
  noFavoritesText: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    marginTop: 20,
  },
  productList: {
    paddingBottom: 20,
  },
  productItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginBottom: 10,
    borderRadius: 10,
    padding: 10,
    marginHorizontal: 10,
    elevation: 5,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 10,
    marginRight: 10,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  productPrice: {
    fontSize: 14,
    color: '#030A8C',
    marginBottom: 5,
  },
  removeButton: {
    color: 'red',
    fontSize: 16,
    marginLeft: 'auto', // Esto empuja el botón de eliminar al extremo derecho
    paddingRight: 10
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 10,
  },
});

export default FavoritesScreen;