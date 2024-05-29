import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text, FlatList, Image } from 'react-native';
import { getAuth } from 'firebase/auth';
import { getDocs, query, collection, where, doc } from 'firebase/firestore';
import { db } from '../services/firebaseConfig';
import TopBar from '../components/TopBar';
import BottomMenuBar from '../components/BottomMenuBar';
import BackButton from '../components/BackButton';

const MyProductsScreen = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUserDataAndProducts = async () => {
      const auth = getAuth();
      const currentUser = auth.currentUser;
      if (currentUser) {
        try {
          const userQuery = query(collection(db, 'usuarios'), where('correo', '==', currentUser.email));
          const userSnapshot = await getDocs(userQuery);
          if (!userSnapshot.empty) {
            const userDoc = userSnapshot.docs[0];
            const userData = userDoc.data();
            const userId = userDoc.id;
            setUser({ ...userData, id: userId });
            console.log('User Data:', { ...userData, id: userId });

            const allProductsSnapshot = await getDocs(collection(db, 'productos'));
            const allProducts = allProductsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            console.log('All Products:', allProducts);

            const userDocRef = doc(db, 'usuarios', userId);
            const userProducts = allProducts.filter(product => {
              const vendedorRef = product.vendedorRef;
              return vendedorRef && vendedorRef._key && vendedorRef._key.path.segments.includes(userId);
            });
            console.log('User Products:', userProducts);
            setProducts(userProducts);
          } else {
            console.error('No se encontró el usuario con el correo:', currentUser.email);
          }
        } catch (error) {
          console.error('Error fetching user data and products:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchUserDataAndProducts();
  }, []);

  const renderProductItem = ({ item }) => (
    <View style={styles.productItem}>
      <Image source={{ uri: item.imagen }} style={styles.productImage} />
      <Text style={styles.productName}>{item.nombre}</Text>
      <Text style={styles.productDescription}>{item.categoria}</Text>
      <Text style={styles.productPrice}>${item.precio}</Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <TopBar />
        <View style={styles.headerContainer}>
          <BackButton />
          <Text style={styles.title}>Mis productos</Text>
        </View>
        <Text style={styles.loadingText}>Cargando productos...</Text>
        <BottomMenuBar isMenuScreen={true} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TopBar />
      <View style={styles.headerContainer}>
        <BackButton />
        <Text style={styles.title}>Mis productos</Text>
      </View>
      <FlatList
        data={products}
        renderItem={renderProductItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.productList}
      />
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
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 10,
  },
  productList: {
    padding: 20,
    marginBottom: 40,
  },
  productItem: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginVertical: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  productImage: {
    width: 100,
    height: 100,
    borderRadius: 10,
    marginBottom: 10,
  },
  productName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#030A8C',
  },
  productDescription: {
    fontSize: 14,
    color: '#8c8c8c',
    textAlign: 'center',
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#030A8C',
  },
  loadingText: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    marginVertical: 20,
  },
});

export default MyProductsScreen;
