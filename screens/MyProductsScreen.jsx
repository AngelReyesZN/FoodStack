import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { getAuth } from 'firebase/auth';
import { getDocs, query, collection, where, doc } from 'firebase/firestore';
import { db } from '../services/firebaseConfig';
import TopBar from '../components/TopBar';
import BottomMenuBar from '../components/BottomMenuBar';
import MainProductCardEdit from '../components/MainProductCardEdit';
import Header from '../components/Header';
import Icon from 'react-native-vector-icons/FontAwesome';
import CustomText from '../components/CustomText';

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

  if (loading) {
    return (
      <View style={styles.container}>
        <TopBar />
        <ActivityIndicator size="large" color="#FF6347" />
        <CustomText style={styles.loadingText}>Cargando productos...</CustomText>
        <BottomMenuBar isMenuScreen={true} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TopBar/>
      <Header title="Mis productos" backButton={false} />
      <FlatList
        data={products}
        renderItem={({ item }) => (
          <MainProductCardEdit
            product={item}
            onEditPress={() => navigation.navigate('EditProduct', { productId: item.id })}
          />
        )}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.productList}
        numColumns={2}
        ListFooterComponent={<View style={{ height: 60 }} />}
      />
      <TouchableOpacity style={styles.addButton} onPress={() => navigation.navigate('AddProduct')}>
        <Icon name="plus" size={24} color="white" />
      </TouchableOpacity>
      <BottomMenuBar isChatScreen={true} />
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
    paddingBottom: 30, // Añadir padding inferior para asegurar que el contenido no se corte
  },
  loadingText: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    marginVertical: 20,
  },
  addButton: {
    backgroundColor: '#FF6347',
    padding: 15,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    bottom: 90,
    right: 20,
    width: 60,
    height: 60,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 5,
  },
});

export default MyProductsScreen;