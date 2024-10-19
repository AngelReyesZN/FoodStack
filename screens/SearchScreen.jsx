import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, FlatList, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { collection, getDocs, query } from 'firebase/firestore';
import { db } from '../services/firebaseConfig';
import BackButton from '../components/BackButton';
import Icon from 'react-native-vector-icons/FontAwesome';
import CustomText from '../components/CustomText';
import { search } from 'react-native-country-picker-modal/lib/CountryService';


const SearchResults = ({ route }) => {
  const searchQuery = route?.params?.searchQuery || '';
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchText, setSearchText] = useState(searchQuery);
  const searchInputRef = useRef(null);
  const navigation = useNavigation();

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

  useEffect(() => {
    handleSearch(searchText);
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchText]);

  const renderItem = ({ item }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate('ProductScreen', { productId: item.id })}
    >
      <View style={styles.item}>
        <Image source={{ uri: item.imagen }} style={[styles.productImage, { alignSelf: 'center' }]} />
        <CustomText style={styles.name}>{item.nombre}</CustomText>
        <CustomText style={styles.price}>${item.precio}.00</CustomText>
      </View>
    </TouchableOpacity>
  );

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
            <Image
              source={require('../assets/search.png')}
              style={styles.searchImage}
            />
            <CustomText style={styles.searchText} fontWeight='SemiBold'>
              Busquedas recientes
            </CustomText>
          </View>
          <CustomText style={styles.removeHistory}>
            Borrar historial
          </CustomText>
        </View>


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
  container: {
    flex: 1,
    backgroundColor: 'white',
    paddingTop: 20,
    padding: 10,
  },
  header: {
    backgroundColor: 'white',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  headerContent: {
    flexDirection: 'row',
    alignContent: 'center',
    alignItems: 'center',
  },
  searchInput: {
    height: 40,
    borderWidth: 1,
    borderColor: '#e6e6e6',
    paddingLeft: 10,
    borderRadius: 50,
    flex: 1,
    fontFamily: "Montserrat-Regular",
  },
  clearButton: {
    position: 'absolute',
    right: 10,
  },
  recentContainer: {
    flexDirection: 'row', // Alinea los elementos en fila
    justifyContent: 'space-between', // Distribuye elementos a izquierda y derecha
    alignItems: 'center', // Alinea los elementos verticalmente al centro
    paddingHorizontal: 10, // Espaciado horizontal
    marginVertical: 10, // Espaciado vertical
  },
  leftSection: {
    flexDirection: 'row', // Imagen y texto alineados en fila
    alignItems: 'center', // Centrado verticalmente
  },
  searchImage: {
    height: 25,
    width: 25,
    marginRight: 8, // Espacio entre la imagen y el texto

  },
  removeHistory: {
    color: '#FF6347',
    fontSize: 13
  },
  productImage: {
    width: 55,
    height: 55,
    borderRadius: 10,
    marginTop: 5,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    padding: 6,
  },
  name: {
    fontSize: 16,
    paddingLeft: 10,
  },
  price: {
    fontSize: 14,
    color: '#888',
    paddingLeft: 10,
  },
  noResultsText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
    color: "#C6C6C6"
  },
  searchText: {
    fontSize: 16,
    textAlign: 'left',
  },
});

export default SearchResults;
