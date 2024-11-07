import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, Text, FlatList, Image, StyleSheet, TouchableOpacity, 
  KeyboardAvoidingView, Keyboard, Platform, Linking, RefreshControl, Modal 
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { getDoc, doc } from 'firebase/firestore';

import BottomMenuBar from '../components/BottomMenuBar';
import SearchBar from '../components/SearchBar';
import MainProductCard from '../components/MainProductCard';
import ModalProductDetails from '../components/ModalProductDetails';

import { getDocuments } from '../services/firestore';
import { db } from '../services/firebaseConfig';

const HomeScreen = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [products, setProducts] = useState([]);
  const [currentAdIndex, setCurrentAdIndex] = useState(0);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [currentCategory, setCurrentCategory] = useState('Todos');
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const navigation = useNavigation();
  const advertisements = [
    require('../assets/CAMPANA_1.jpg'),
    require('../assets/sac.jpg'),
    require('../assets/prope.png')
  ];

  useEffect(() => {
    const keyboardListeners = [
      Keyboard.addListener('keyboardDidShow', () => setKeyboardVisible(true)),
      Keyboard.addListener('keyboardDidHide', () => setKeyboardVisible(false))
    ];
    return () => keyboardListeners.forEach(listener => listener.remove());
  }, []);

  useEffect(() => {
    fetchProducts();
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchProducts();
    }, [])
  );

  useEffect(() => {
    const intervalId = setInterval(nextAd, 5000);
    return () => clearInterval(intervalId);
  }, [currentAdIndex]);

  const fetchProducts = async () => {
    try {
      const productsList = await getDocuments('productos');
      const productsWithVendors = await Promise.all(productsList.map(enrichProductWithVendor));
      setProducts(productsWithVendors);
      applyCategoryFilter(productsWithVendors, currentCategory);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  const enrichProductWithVendor = async (product) => {
    try {
      if (product.vendedorRef?.path) {
        const vendorDoc = await getDoc(doc(db, product.vendedorRef.path));
        return vendorDoc.exists() 
          ? { ...product, vendedor: vendorDoc.data() }
          : { ...product, vendedor: null };
      }
    } catch (error) {
      console.error("Error fetching vendor data:", error);
    }
    return { ...product, vendedor: null };
  };

  const applyCategoryFilter = (products, category) => {
    let filtered = products.filter(product => product.cantidad > 0 && product.statusView);
    if (category !== 'Todos') {
      filtered = filtered.filter(product => product.categoria === category);
    }
    setFilteredProducts(filtered);
  };

  const nextAd = () => setCurrentAdIndex((currentAdIndex + 1) % advertisements.length);

  const handleSearch = () => navigation.navigate('SearchResults', { searchQuery });

  const handleLinkPress = () => Linking.openURL('https://www.facebook.com/fifuaq');

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchProducts();
    setRefreshing(false);
  }, [currentCategory]);

  const handleAddToFavorites = (product) => {
    console.log('Added to favorites:', product);
  };

  const handleCardPress = (product) => {
    setSelectedProduct(product);
    setModalVisible(true);
  };

  const filterByCategory = (category) => {
    setCurrentCategory(category);
    setSelectedCategory(category);
    applyCategoryFilter(products, category);
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <SearchBar query={searchQuery} setQuery={setSearchQuery} onSearch={handleSearch} />
      <FlatList
        ListHeaderComponent={
          <>
            <AdSection 
              advertisements={advertisements} 
              currentAdIndex={currentAdIndex} 
              onNextAd={nextAd} 
              onLinkPress={handleLinkPress} 
            />
            <CategorySection 
              currentCategory={currentCategory} 
              selectedCategory={selectedCategory} 
              onCategorySelect={filterByCategory} 
            />
          </>
        }
        data={filteredProducts}
        renderItem={({ item }) => (
          <MainProductCard
            product={item}
            onCardPress={() => handleCardPress(item)}
            onAddToCart={() => console.log('Added to cart:', item)}
            onAddToFavorites={() => handleAddToFavorites(item)}
          />
        )}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        contentContainerStyle={styles.productList}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
      {!keyboardVisible && <BottomMenuBar isHomeScreen />}
      <TouchableOpacity style={styles.cartButton} onPress={() => console.log('Cart')}>
        <Icon name="shopping-cart" size={34} color="white" />
      </TouchableOpacity>
      <ModalProductDetails 
        visible={modalVisible} 
        product={selectedProduct} 
        onClose={() => setModalVisible(false)} 
      />
    </KeyboardAvoidingView>
  );
};

const AdSection = ({ advertisements, currentAdIndex, onNextAd, onLinkPress }) => (
  <TouchableOpacity onPress={onNextAd} style={styles.adContainer}>
    <Image source={advertisements[currentAdIndex]} style={styles.adImage} />
    <View style={styles.linkContainer}>
      <Text style={styles.linkText}>
        Ve todos los anuncios <Text style={styles.linkHighlight} onPress={onLinkPress}>aquí</Text>
      </Text>
    </View>
  </TouchableOpacity>
);

const CategorySection = ({ currentCategory, selectedCategory, onCategorySelect }) => (
  <View style={styles.categoryContainer}>
    <FlatList
      horizontal
      data={categories}
      renderItem={({ item }) => (
        <TouchableOpacity onPress={() => onCategorySelect(item.key)} style={styles.iconWrapper}>
          <Text style={[
            styles.iconText,
            selectedCategory === item.key ? styles.selectedCategory : styles.unselectedCategory
          ]}>
            {item.key}
          </Text>
        </TouchableOpacity>
      )}
      keyExtractor={(item) => item.key}
      showsHorizontalScrollIndicator={false}
    />
    <Text style={styles.allProductsText}>
      {currentCategory === 'Todos' ? 'Todos los productos' : currentCategory}
    </Text>
  </View>
);

const categories = [
  { key: 'Todos', icon: require('../assets/todo.png') },
  { key: 'Comida', icon: require('../assets/comida.png') },
  { key: 'Bebidas', icon: require('../assets/refresco.png') },
  { key: 'Frituras', icon: require('../assets/frituras.png') },
  { key: 'Postres', icon: require('../assets/postres.png') },
  { key: 'Dulces', icon: require('../assets/dulces.png') },
  { key: 'Dispositivos', icon: require('../assets/dispositivos.png') },
  { key: 'Otros', icon: require('../assets/mas.png') },
];


const styles = StyleSheet.create({
  ScrollViewMain: {
    marginBottom: 45,
  },
  container: {
    flex: 1,
    backgroundColor: 'white',
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
    width: '100%', 
    paddingHorizontal: 20, 
  },
  linkText: {
    textAlign: 'right',
    marginTop: 4,
    fontSize: 14,
  },
  linkHighlight: {
    color: '#FF6347',
    textDecorationLine: 'underline',
  },
  iconContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  },
  iconWrapper: {
    paddingTop: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  iconImage: {
    width: 40,
    height: 40,
  },
  iconText: {
    borderWidth: 1,
    borderColor: '#ccc',
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 5,
    paddingHorizontal: 10,
    marginTop: 5,
    marginBottom: 5,
    fontSize: 12,
    color: '#666',
    fontWeight: 'bold',
  },
  selectedCategory: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    opacity: 1,
  },
  unselectedCategory: {
    opacity: 0.5,
  },
  containerProduccts: {
    flex: 1,
    margin: 20,
  },
  allProductsText: {
    fontSize: 20,
    marginLeft: 10,
    marginBottom: 5,
    fontWeight: 'bold',
    marginTop: 15,
  },
  productList: {
    paddingHorizontal: 10,
    paddingBottom: 100,
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
    paddingTop: 8
  },
  productImage: {
    width: '100%',
    height: 80,
    resizeMode: 'contain',
    borderRadius: 10,
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

  // Estilos de categorySearch

  searchResultContainer: {
    flexGrow: 1,
    paddingBottom: 20,
    zIndex: 1,
  },
  categoryContainer: {
    marginTop: 10,
    marginBottom: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchResultContainer: {
    flexGrow: 1,
    paddingBottom: 20,
    zIndex: 1,
  },
  iconScrollView: {
    marginTop: 10,
    marginBottom: 15,
  },
  iconWrapper: {
    paddingTop: 8,
    alignItems: 'center',
    marginHorizontal: 5,
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
  cartButton: {
    position: 'absolute',
    bottom: 80,
    right: 20,
    height: 80,
    width: 80,
    backgroundColor: '#FF6347',
    padding: 15,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
  },
});

export default HomeScreen;