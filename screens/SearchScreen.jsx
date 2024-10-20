import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, FlatList, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { collection, getDocs, query } from 'firebase/firestore';
import { db } from '../services/firebaseConfig';
import BackButton from '../components/BackButton';
import Icon from 'react-native-vector-icons/FontAwesome';

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
        <Text style={styles.name}>{item.nombre}</Text>
        <Text style={styles.price}>${item.precio}.00</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <BackButton/>
          <TextInput
            ref={searchInputRef}
            style={styles.searchInput}
            placeholder="Buscar en changarrito"
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
      </View>
      {filteredProducts.length > 0 ? (
        <FlatList
          data={filteredProducts}
          renderItem={renderItem}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.productList}
        />
      ) : (
        <Text style={styles.noResultsText}>No se encontraron productos</Text>
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
    height: 30,
    borderWidth: 1,
    borderColor: '#ccc',
    paddingLeft: 10,
    borderRadius: 5,
    borderColor: 'white',
    flex: 1,
  },
  clearButton: {
    position: 'absolute',
    right: 10,
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
    fontWeight: 'bold',
    paddingLeft: 10,
  },
  price: {
    fontSize: 14,
    color: '#888',
    paddingLeft: 10,
  },
  noResultsText: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 20,
  },
});

export default SearchResults;
