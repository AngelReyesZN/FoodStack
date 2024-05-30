import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, Image, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import BottomMenuBar from '../components/BottomMenuBar';
import SearchBar from '../components/SearchBar';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { getDocuments } from '../services/firestore';
import { getDoc, doc } from 'firebase/firestore';
import { db } from '../services/firebaseConfig';

const HomeScreen = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [currentAdIndex, setCurrentAdIndex] = useState(0);
  const [products, setProducts] = useState([]);
  const navigation = useNavigation();

  const fetchProducts = async () => {
    try {
      const productsList = await getDocuments('productos');
      const productsWithVendors = await Promise.all(productsList.map(async (product) => {
        if (product.vendedorRef && typeof product.vendedorRef === 'object' && 'path' in product.vendedorRef) {
          try {
            const vendorDoc = await getDoc(doc(db, product.vendedorRef.path));
            if (vendorDoc.exists()) {
              return { ...product, vendedor: vendorDoc.data() };
            } else {
              console.error("Vendor document not found for reference:", product.vendedorRef.path);
              return { ...product, vendedor: null };
            }
          } catch (error) {
            console.error("Error fetching vendor data:", error);
            return { ...product, vendedor: null };
          }
        } else {
          console.error("Invalid vendor reference:", product.vendedorRef);
          return { ...product, vendedor: null };
        }
      }));
      setProducts(productsWithVendors);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchProducts();
    }, [])
  );

  const advertisements = [
    'https://scontent.fqro1-1.fna.fbcdn.net/v/t39.30808-6/431924625_834945361983553_7341690926487425115_n.jpg?_nc_cat=106&ccb=1-7&_nc_sid=5f2048&_nc_ohc=hjbwOULZqmcQ7kNvgHNp4uH&_nc_ht=scontent.fqro1-1.fna&oh=00_AYA8xfn9Pst5WweY6yDIsLMJxpjgDcC12wYDVrpJM4edHg&oe=66485A21',
    'https://scontent.fqro1-1.fna.fbcdn.net/v/t39.30808-6/438759407_862392059238883_8850205864236275089_n.jpg?_nc_cat=100&ccb=1-7&_nc_sid=5f2048&_nc_ohc=McCt6l--9HgQ7kNvgH1qcXH&_nc_ht=scontent.fqro1-1.fna&oh=00_AYCqyLRWCIQrGX4eQPBJCJKy7p8R1qq4rPhufFOwtL1b6A&oe=66484ADF',
    'https://scontent.fqro1-1.fna.fbcdn.net/v/t39.30808-6/440322875_865818908896198_3144556912844658936_n.jpg?_nc_cat=107&ccb=1-7&_nc_sid=5f2048&_nc_ohc=J41NSersfGIQ7kNvgErPmKq&_nc_ht=scontent.fqro1-1.fna&oh=00_AYCftfKAcc_QuQUs1nOEjrL9mEVSQQ0UU38n6Pa4MvGCLQ&oe=664872CF',
  ];

  const handleSearch = (text) => {
    navigation.navigate('SearchResults', { searchQuery });
  };

  const nextAd = () => {
    setCurrentAdIndex(currentAdIndex === advertisements.length - 1 ? 0 : currentAdIndex + 1);
  };

  useEffect(() => {
    const intervalId = setInterval(nextAd, 5000);
    return () => clearInterval(intervalId);
  }, [currentAdIndex]);

  const renderItem = ({ item }) => {
    return (
      <TouchableOpacity
        style={styles.productItem}
        onPress={() => navigation.navigate('ProductScreen', { productId: item.id })}
      >
        <Image source={{ uri: item.imagen }} style={[styles.productImage, { alignSelf: 'center' }]} />
        <View style={styles.productInfo}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={styles.productName}>{item.nombre}</Text>
            <Text style={styles.productPrice}>${item.precio}.00</Text>
          </View>
          <Text style={styles.productUnits}>Unidades: {item.cantidad}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <SearchBar />
      <TouchableOpacity onPress={nextAd} style={styles.adContainer}>
        <Animated.Image
          source={{ uri: advertisements[currentAdIndex] }}
          style={styles.adImage}
        />
      </TouchableOpacity>
      <TouchableOpacity onPress={() => alert("¡Te llevaremos a todos los anuncios aquí!")} style={styles.linkContainer}>
        <Text style={styles.linkText}>Ve todos los anuncios <Text style={{ color: '#030A8C' }}>aquí</Text></Text>
      </TouchableOpacity>
      <View style={styles.iconContainer}>
        <View style={styles.iconWrapper}>
          <View style={[styles.iconCircle, { backgroundColor: '#e82d2d' }]}>
            <Image source={require('../assets/frituras.png')} style={styles.iconImage} />
          </View>
          <Text style={styles.iconText}>Frituras</Text>
        </View>
        <View style={styles.iconWrapper}>
          <View style={[styles.iconCircle, { backgroundColor: '#5fe8bf' }]}>
            <Image source={require('../assets/dulces.png')} style={styles.iconImage} />
          </View>
          <Text style={styles.iconText}>Dulces</Text>
        </View>
        <View style={styles.iconWrapper}>
          <View style={[styles.iconCircle, { backgroundColor: '#dfe164' }]}>
            <Image source={require('../assets/comida.png')} style={styles.iconImage} />
          </View>
          <Text style={styles.iconText}>Comida</Text>
        </View>
        <View style={styles.iconWrapper}>
          <View style={[styles.iconCircle, { backgroundColor: '#f496e5' }]}>
            <Image source={require('../assets/postres.png')} style={styles.iconImage} />
          </View>
          <Text style={styles.iconText}>Postres</Text>
        </View>
        <View style={styles.iconWrapper}>
          <View style={[styles.iconCircle, { backgroundColor: '#aa9e9e' }]}>
            <Image source={require('../assets/dispositivos.png')} style={styles.iconImage} />
          </View>
          <Text style={styles.iconText}>Dispositivos</Text>
        </View>
      </View>
      <View style={styles.containerProduccts}>
        <Text style={styles.allProductsText}>Todos los productos</Text>
        <FlatList
          data={products}
          renderItem={renderItem}
          keyExtractor={item => item.id.toString()}
          numColumns={2}
          contentContainerStyle={[styles.productList, { flexGrow: 1 }]}
        />
      </View>
      <BottomMenuBar isHomeScreen={true}/>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    paddingTop: 20,
  },
  header: {
    backgroundColor: 'white',
    paddingTop: 15,
    paddingBottom: 5,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  searchInput: {
    flex: 1,
    height: 30,
    borderWidth: 1,
    borderColor: '#ccc',
    paddingLeft: 10,
    borderRadius: 5,
    borderColor: 'white',
    marginTop: 8,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  image: {
    width: 50,
    height: 50,
    marginRight: 10,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  price: {
    fontSize: 14,
    color: '#888',
  },
  adContainer: {
    paddingTop: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 40,
    borderWidth: 1,
    borderColor: 'white',
    marginBottom: 10,
  },
  adImage: {
    width: 350,
    height: 180,
    resizeMode: 'cover',
    borderRadius: 20,
  },
  linkContainer: {
    alignItems: 'center',
  },
  linkText: {
    textAlign: 'center',
    marginTop: 4,
    fontSize: 12,
    borderWidth: 3,
    padding: 5,
    width: 225,
    borderRadius: 20,
    borderColor: '#ccc',
    elevation: 30,
  },
  iconContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  },
  iconWrapper: {
    paddingTop: 8,
    alignItems: 'center',
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  iconImage: {
    width: 40,
    height: 40,
  },
  iconText: {
    marginTop: 5,
    fontSize: 12,
  },
  containerProduccts:{
    flex: 1,
    margin: 20,
  },
  allProductsText: {
    fontSize: 20,
    marginLeft: 10,
    marginBottom:  10,
    fontWeight: 'bold',
  },
  productList: {
    paddingHorizontal: 10,
    paddingBottom: 40,
  },
  productItem: {
    flex: 1,
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    margin: 5,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 4, 
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    borderWidth: .5,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 10,
    margin: 10,
  },
  productInfo: {
    flex: 1,
    marginLeft: 8,
  },
  productName: {
    flex: 1,
    fontSize: 15,
    fontWeight: 'bold',
    marginLeft: 2,
    textAlign: 'left',
  },
  productPrice: {
    marginRight: 10,
    fontSize: 15,
    fontWeight: 'bold',
    color: '#030A8C',
    textAlign: 'right',
  },
  productUnits: {
    fontSize: 14,
    marginTop: 5,
    marginLeft: 2,
    marginBottom: 5,
    color: '#666',
  },
  favoriteIcon: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  searchResultContainer: {
    flexGrow: 1,
    paddingBottom: 20,
    zIndex: 1,
  },
});

export default HomeScreen;
