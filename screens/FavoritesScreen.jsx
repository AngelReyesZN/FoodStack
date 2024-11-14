import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { db, auth } from '../services/firebaseConfig';
import { doc, getDoc, getDocs, query, where, collection, updateDoc, arrayRemove, arrayUnion } from 'firebase/firestore';
import TopBar from '../components/TopBar';
import BottomMenuBar from '../components/BottomMenuBar';
import BackButton from '../components/BackButton';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import MainProductCard from '../components/MainProductCard';
import CustomText from '../components/CustomText';
import Header from '../components/Header';

const FavoritesScreen = () => {
  const [favorites, setFavorites] = useState([]);
  const [initialFavorites, setInitialFavorites] = useState([]);
  const [pendingChanges, setPendingChanges] = useState([]);
  const navigation = useNavigation();

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
          setInitialFavorites(favs);
        }
      } catch (error) {
        console.error('Error al cargar favoritos:', error);
      }
    };

    fetchFavorites();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      const syncPendingChanges = async () => {
        try {
          const userQuery = query(collection(db, 'usuarios'), where('correo', '==', auth.currentUser.email));
          const userSnapshot = await getDocs(userQuery);
          if (!userSnapshot.empty) {
            const userDocRef = userSnapshot.docs[0].ref;
            for (const change of pendingChanges) {
              if (change.type === 'remove') {
                await updateDoc(userDocRef, {
                  favoritos: arrayRemove(doc(db, 'productos', change.productId))
                });
              } else if (change.type === 'add') {
                await updateDoc(userDocRef, {
                  favoritos: arrayUnion(doc(db, 'productos', change.productId))
                });
              }
            }
            setPendingChanges([]);
          }
        } catch (error) {
          console.error('Error al sincronizar cambios de favoritos:', error);
        }
      };

      return () => {
        syncPendingChanges();
      };
    }, [pendingChanges])
  );

  const toggleFavorite = (productId) => {
    setFavorites((prevFavorites) => {
      const isFavorite = prevFavorites.some((fav) => fav.id === productId);
      if (isFavorite) {
        setPendingChanges((prev) => [...prev, { type: 'remove', productId }]);
        return prevFavorites.filter((fav) => fav.id !== productId);
      } else {
        setPendingChanges((prev) => [...prev, { type: 'add', productId }]);
        const addedProduct = initialFavorites.find((product) => product.id === productId);
        return [...prevFavorites, addedProduct];
      }
    });
  };

  const renderItem = ({ item }) => {
    const isFavorite = favorites.some((fav) => fav.id === item.id);
    
    return (
      <MainProductCard 
        product={item} 
        navigation={navigation}
        isFavorite={isFavorite}
        onToggleFavorite={() => toggleFavorite(item.id)} 
      />
    );
  };

  return (
    <View style={styles.container}>
      <TopBar />
      <Header title="Favoritos" />
      <View style={styles.horizontalBar}></View>
      {favorites.length === 0 ? (
        <Text style={styles.noFavoritesText}>No tienes productos favoritos aún.</Text>
      ) : (
        <FlatList
          data={favorites}
          renderItem={renderItem}
          numColumns={2}
          ListFooterComponent={<View style={{ height: 60 }} />}
          keyExtractor={item => item.id.toString()}
          key={2} // Cambia la propiedad key para forzar una nueva renderización
          contentContainerStyle={[styles.productList, { paddingBottom: 100 }]}
          columnWrapperStyle={styles.columnWrapper} // Estilo para las columnas
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
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center', // Centra los elementos horizontalmente
    paddingHorizontal: 20,
    marginTop: 20,
    width: '90%',
    alignSelf: 'center', // Centra el contenedor horizontal
    marginVertical: 10,
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center', // Centra el título horizontalmente
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#030A8C',
  },
  horizontalBar: {
    height: 1,
    backgroundColor: '#D6DBDE',
    marginTop: 10,
    width: '90%',
    alignSelf: 'center',
  },
  noFavoritesText: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    marginTop: 20,
  },
  productList: {
    paddingBottom: 20,
    paddingTop: 20,
  },
  columnWrapper: {
    justifyContent: 'space-between', // Espacio entre las columnas
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
    position: 'relative',
    flex: 1, // Asegura que los elementos ocupen el mismo espacio
    maxWidth: '48%', // Ajusta el ancho máximo de los elementos
  },
  productImage: {
    width: 80,
    height: 80,
    resizeMode: 'contain',
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
  favoriteIcon: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  favoriteIconWrapper: {
    borderWidth: 1,
    borderColor: '#D6DBDE',
    borderRadius: 6,
    padding: 3,
  },
  backButtonContainer: {
    position: 'absolute',
    left: 0,
  },
});

export default FavoritesScreen;