import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text, FlatList, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { getAuth } from 'firebase/auth';
import { getDocs, query, collection, where, doc } from 'firebase/firestore';
import { db } from '../services/firebaseConfig';
import TopBar from '../components/TopBar';
import BottomMenuBar from '../components/BottomMenuBar';
import BackButton from '../components/BackButton';

const MyProductsScreen = ({ navigation }) => {
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

            const allProductsSnapshot = await getDocs(collection(db, 'productos'));
            const allProducts = allProductsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

            const userDocRef = doc(db, 'usuarios', userId);
            const userProducts = allProducts.filter(product => {
              const vendedorRef = product.vendedorRef;
              return vendedorRef && vendedorRef._key && vendedorRef._key.path.segments.includes(userId);
            });

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
      <TouchableOpacity
        style={styles.editIcon}
        onPress={() => navigation.navigate('EditProduct', { productId: item.id })}
      >
          <Image source={require('../assets/edit.png')} style={styles.iconImage} />
      </TouchableOpacity>
      <View style={styles.productInfoContainer}>
        <View style={styles.productInfoRow}>
          <Text style={styles.productName}>{item.nombre}</Text>
          <Text style={styles.productPrice}>${item.precio.toFixed(2)}</Text>
        </View>
        <Text style={styles.productUnits}>Unidades: {item.cantidad}</Text>
      </View>
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
        <ActivityIndicator size="large" color="#FF6347" />
        <Text style={styles.loadingText}>Cargando productos...</Text>
        <BottomMenuBar isMenuScreen={true} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TopBar title="Mis productos" showBackButton={true} navigation={navigation} showSearchBar={false} />
      <FlatList
        data={products}
        renderItem={renderProductItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.productList}
        numColumns={2}
        ListFooterComponent={<View style={{ height: 60 }} />} // Añade un margen inferior adicional
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
    padding: 10,
  },
  productItem: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
    margin: 10,
    flex: 1,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    position: 'relative',
    paddingTop: 30
  },
  productImage: {
    width: '100%',
    height: 80,
    resizeMode: 'contain',
    borderRadius: 10,
  },
  productInfoContainer: {
    width: '100%',
    alignItems: 'flex-start',
  },
  productInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 5,
  },
  productName: {
    flex: 1,
    fontSize: 15,
    fontWeight: 'bold',
    textAlign: 'left',
  },
  productPrice: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#030A8C',
    textAlign: 'right',
  },
  productUnits: {
    fontSize: 14,
    marginTop: 5,
    color: '#666',
  },
  loadingText: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    marginVertical: 20,
  },
  editIcon: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  iconImage: {
    width: 20,
    height: 20,
  },
});

export default MyProductsScreen;
