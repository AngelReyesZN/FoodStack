import React, { useState, useEffect, useRef } from 'react';
import { View, TextInput, FlatList, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { collection, getDocs, query } from 'firebase/firestore';
import { db } from '../services/firebaseConfig';
import BackButton from '../components/BackButton';
import Icon from 'react-native-vector-icons/FontAwesome';
import CustomText from '../components/CustomText';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SearchResults = ({ route }) => {
  const searchQuery = route?.params?.searchQuery || '';
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchText, setSearchText] = useState(searchQuery);
  const [recentSearches, setRecentSearches] = useState([]); // Almacena búsquedas recientes
  const searchInputRef = useRef(null);
  const navigation = useNavigation();

  useEffect(() => {
    loadRecentSearches(); // Cargar las búsquedas recientes al iniciar la pantalla
  }, []);

  const handleSearch = async (text) => {
    if (text.trim() === '') {
      setFilteredProducts([]);
      return;
    }

    const lowerText = text.toLowerCase();
    const productsQuery = query(collection(db, 'productos'));
    const querySnapshot = await getDocs(productsQuery);
    const products = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    const filtered = products.filter(product =>
      product.nombre.toLowerCase().includes(lowerText) &&
      product.cantidad > 0 &&
      product.statusView === true
    );

    setFilteredProducts(filtered);
  };

  const saveSearch = async (text) => {
    const updatedSearches = [...new Set([text, ...recentSearches])].slice(0, 5); // Mantiene solo las últimas 5 búsquedas
    setRecentSearches(updatedSearches);
    await AsyncStorage.setItem('recentSearches', JSON.stringify(updatedSearches)); // Guardar en AsyncStorage
  };

  const loadRecentSearches = async () => {
    try {
      const storedSearches = await AsyncStorage.getItem('recentSearches');
      if (storedSearches) {
        setRecentSearches(JSON.parse(storedSearches)); // Cargar búsquedas recientes almacenadas
      }
    } catch (error) {
      console.error('Error loading recent searches', error);
    }
  };

  const handleProductPress = (item) => {
    saveSearch(searchText); // Guardar la búsqueda solo si se hace clic en un producto
    navigation.navigate('ProductScreen', { productId: item.id });
  };

  const renderRecentItem = ({ item }) => (
    <TouchableOpacity onPress={() => setSearchText(item)} style={styles.recentItemContainer}>
      <Image
        source={require('../assets/SearchScreenIcons/clock.png')}
        style={styles.clockImage}
      />
      <CustomText style={styles.recentItemText}>{item}</CustomText>
    </TouchableOpacity>
  );



  useEffect(() => {
    handleSearch(searchText);
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchText]);

  const renderItem = ({ item }) => (
    <TouchableOpacity onPress={() => handleProductPress(item)}>
      <View style={styles.item}>
        <Image source={{ uri: item.imagen }} style={[styles.productImage, { alignSelf: 'center' }]} />
        <CustomText style={styles.name}>{item.nombre}</CustomText>
        <CustomText style={styles.price}>${item.precio}.00</CustomText>
      </View>
    </TouchableOpacity>
  );
  const clearSearchHistory = async () => {
    try {
      await AsyncStorage.removeItem('recentSearches'); // Elimina las búsquedas de AsyncStorage
      setRecentSearches([]); // Limpia el estado local
    } catch (error) {
      console.error('Error clearing search history', error);
    }
  };


  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <BackButton />
          <TextInput
            ref={searchInputRef}
            style={styles.searchInput}
            placeholder="Buscar productos..."
            value={searchText}
            onChangeText={setSearchText}
            autoFocus={true}
          />
          {searchText.length > 0 && (
            <TouchableOpacity style={styles.clearButton} onPress={() => setSearchText('')}>
              <Icon name="times-circle" size={20} color="#888" />
            </TouchableOpacity>
          )}
        </View>
        <View style={styles.recentContainer}>
          <View style={styles.leftSection}>
            <Image source={require('../assets/search.png')} style={styles.searchImage} />
            <CustomText style={styles.searchText} fontWeight='SemiBold'>
              Búsquedas recientes
            </CustomText>
          </View>
          <TouchableOpacity onPress={clearSearchHistory}>
            <CustomText style={styles.removeHistory}>Borrar historial</CustomText>
          </TouchableOpacity>
        </View>
        <FlatList
          data={recentSearches}
          renderItem={renderRecentItem}
          keyExtractor={(item, index) => index.toString()}
          contentContainerStyle={styles.recentList}
        />
      </View>
      {filteredProducts.length > 0 ? (
        <FlatList
          data={filteredProducts}
          renderItem={renderItem}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.productList}
        />
      ) : (
        <CustomText style={styles.noResultsText}>No se encontraron productos</CustomText>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'white', paddingTop: 10, padding: 10 },
  header: { backgroundColor: 'white', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#ccc' },
  headerContent: { flexDirection: 'row', alignItems: 'center' },
  searchInput: { height: 40, borderWidth: 1, borderColor: '#e6e6e6', paddingLeft: 10, borderRadius: 50, flex: 1 },
  clearButton: { position: 'absolute', right: 10 },
  recentContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 10, marginVertical: 10 },
  leftSection: { flexDirection: 'row', alignItems: 'center' },
  searchImage: { height: 25, width: 25, marginRight: 8 },
  removeHistory: { color: '#FF6347', fontSize: 13 },
  recentList: { marginTop: 10 },
  productImage: { width: 55, height: 55, borderRadius: 10, marginTop: 5 },
  item: { flexDirection: 'row', alignItems: 'center', marginBottom: 10, borderBottomWidth: 1, borderBottomColor: '#ccc', padding: 6 },
  name: { fontSize: 16, paddingLeft: 10 },
  price: { fontSize: 14, color: '#888', paddingLeft: 10 },
  noResultsText: { fontSize: 16, textAlign: 'center', marginTop: 20, color: "#C6C6C6" },
  searchText: { fontSize: 16, textAlign: 'left' },
  recentItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5,
    paddingHorizontal: 10,
  },
  clockImage: {
    width: 20,
    height: 20,
    marginRight: 10, // Espacio entre la imagen y el texto
  },
  recentItemText: {
    fontSize: 16,
    color: '#555',
  },
});

export default SearchResults;
