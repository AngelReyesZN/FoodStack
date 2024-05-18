import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, FlatList, Image, StyleSheet, TouchableOpacity, Animated } from 'react-native';

import products from '../data/products'; // Importa tus datos de productos
import LogoImage from '../assets/Logo.png';
import Icon from 'react-native-vector-icons/FontAwesome';
import BottomMenuBar from '../components/BottomMenuBar';
import SearchBar from '../components/SearchBar';
import { useNavigation } from '@react-navigation/native';

import products from './products'; // Importa tus datos de productos
import LogoImage from '../assets/Logo.png';
import Icon from 'react-native-vector-icons/FontAwesome';
import BottomMenuBar from '../components/BottomMenuBar';


const HomeScreen = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [currentAdIndex, setCurrentAdIndex] = useState(0); // Índice de la imagen actual
  const [favorites, setFavorites] = useState([]); // Estado para manejar los productos favoritos
  const navigation = useNavigation();


  const advertisements = [
    'https://scontent.fqro1-1.fna.fbcdn.net/v/t39.30808-6/431924625_834945361983553_7341690926487425115_n.jpg?_nc_cat=106&ccb=1-7&_nc_sid=5f2048&_nc_ohc=hjbwOULZqmcQ7kNvgHNp4uH&_nc_ht=scontent.fqro1-1.fna&oh=00_AYA8xfn9Pst5WweY6yDIsLMJxpjgDcC12wYDVrpJM4edHg&oe=66485A21',
    'https://scontent.fqro1-1.fna.fbcdn.net/v/t39.30808-6/438759407_862392059238883_8850205864236275089_n.jpg?_nc_cat=100&ccb=1-7&_nc_sid=5f2048&_nc_ohc=McCt6l--9HgQ7kNvgH1qcXH&_nc_ht=scontent.fqro1-1.fna&oh=00_AYCqyLRWCIQrGX4eQPBJCJKy7p8R1qq4rPhufFOwtL1b6A&oe=66484ADF',
    'https://scontent.fqro1-1.fna.fbcdn.net/v/t39.30808-6/440322875_865818908896198_3144556912844658936_n.jpg?_nc_cat=107&ccb=1-7&_nc_sid=5f2048&_nc_ohc=J41NSersfGIQ7kNvgErPmKq&_nc_ht=scontent.fqro1-1.fna&oh=00_AYCftfKAcc_QuQUs1nOEjrL9mEVSQQ0UU38n6Pa4MvGCLQ&oe=664872CF',
  ];

  const handleSearch = (text) => {

    navigation.navigate('SearchResults', { searchQuery });

    setSearchQuery(text);
    const filtered = products.filter(product =>
      product.nombre.toLowerCase().includes(text.toLowerCase()) || 
      product.unidades.toString().toLowerCase().includes(text.toLowerCase())
    );
    setFilteredProducts(filtered);

  };

  const nextAd = () => {
    // Incrementa el índice de la imagen actual y vuelve al principio si llega al final
    setCurrentAdIndex(currentAdIndex === advertisements.length - 1 ? 0 : currentAdIndex + 1);
  };

  useEffect(() => {
    // Configura un intervalo para cambiar automáticamente de anuncio cada 5 segundos
    const intervalId = setInterval(nextAd, 5000);
    return () => clearInterval(intervalId); // Limpia el intervalo cuando el componente se desmonta
  }, [currentAdIndex]); // Ejecuta el efecto cuando cambia el índice del anuncio actual

  const toggleFavorite = (productId) => {
    if (favorites.includes(productId)) {
      setFavorites(favorites.filter(id => id !== productId));
    } else {
      setFavorites([...favorites, productId]);
    }
  };


  const renderItem = ({ item }) => {
    const isFavorite = favorites.includes(item.id);
    return (
      <TouchableOpacity
        style={styles.productItem}
        onPress={() =>
          navigation.navigate('ProductScreen', {
            product: item,
            isFavorite: favorites.includes(item.id), // Pasar el estado de favorito
          })
        }      
        >
        <TouchableOpacity style={styles.favoriteIcon} onPress={() => toggleFavorite(item.id)}>
          <Icon name={isFavorite ? 'heart' : 'heart-o'} size={20} color={isFavorite ? 'red' : '#030A8C'} />
        </TouchableOpacity>
        <Image source={{ uri: item.imagen }} style={[styles.productImage, { alignSelf: 'center' }]} />

  const renderItem = ({ item }) => {
    const isFavorite = favorites.includes(item.id);

    return (
      <TouchableOpacity style={styles.productItem}>
        <TouchableOpacity style={styles.favoriteIcon} onPress={() => toggleFavorite(item.id)}>
          <Icon name={isFavorite ? 'heart' : 'heart-o'} size={20} color={isFavorite ? 'red' : '#030A8C'} />
        </TouchableOpacity>
        <Image source={{ uri: item.imagen }} style={[styles.productImage, { alignSelf: 'center'}]} />

        <View style={styles.productInfo}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={styles.productName}>{item.nombre}</Text>
            <Text style={styles.productPrice}>Precio: {item.precio}</Text>
          </View>
          <Text style={styles.productUnits}>Unidades: {item.unidades}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>

      {/* Barra de búsqueda */}
      <SearchBar />
      <View style={styles.header}>
        <View style={{ flexDirection: 'row', alignContent: 'center', alignItems: 'center' }}>
          <Image
            source={LogoImage}
            style={{ width: 40, height: 40, marginRight:10, marginTop: 10 }}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar en changarrito"
            value={searchQuery}
            onChangeText={handleSearch}
          />
          <TouchableOpacity onPress={() => handleSearch(searchQuery)}>
            <Icon name="search" size={20} color="#000" style={{marginLeft: 10}} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Contenedor de anuncios */}
      <TouchableOpacity onPress={nextAd} style={styles.adContainer}>
        <Animated.Image
          source={{ uri: advertisements[currentAdIndex] }}
          style={styles.adImage}
        />
      </TouchableOpacity>

      {searchQuery !== '' && (
        <FlatList
          data={filteredProducts}
          renderItem={renderItem}
          keyExtractor={item => item.id.toString()}
          numColumns={2}
          contentContainerStyle={styles.productList}
        />
      )}

      {/* Texto con enlace */}
      <TouchableOpacity onPress={() => alert("¡Te llevaremos a todos los anuncios aquí!")} style={styles.linkContainer}>
        <Text style={styles.linkText}>Ve todos los anuncios <Text style={{ color: '#030A8C' }}>aquí</Text></Text>
      </TouchableOpacity>
      {/* Iconos */}
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
      {/* Texto "Todos los productos" */}
      <Text style={styles.allProductsText}>Todos los productos</Text>
      {/* Catálogo de productos */}
      <FlatList
        data={products}
        renderItem={renderItem}
        keyExtractor={item => item.id.toString()}
        numColumns={2}
        contentContainerStyle={styles.productList}
      />
      {/* Agregar la barra de menú al final */}

      <BottomMenuBar isHomeScreen={true}/>

      <BottomMenuBar />

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    paddingTop: 20,


    padding: 0,

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
    elevation: 30, // Efecto de elevación
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
  allProductsText: {
    fontSize: 20,
    marginLeft: 10,
    marginTop: 20,
    fontWeight: 'bold',
  },
  productList: {
    paddingHorizontal: 10,
    paddingBottom: 20,
  },
  productItem: {
    flex: 1,
    justifyContent: 'space-between',
    backgroundColor: '#f5f5f5',
    margin: 5,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 10,
    marginTop: 5,
  },
  productInfo: {
    flex: 1,
    marginLeft: 5,
  },
  productName: {
    flex: 1, // Para ocupar todo el espacio disponible en la fila
    fontSize: 13,
    fontWeight: 'bold',
    marginLeft: 2,
    textAlign: 'left', // Alinear el texto a la izquierda
  },
  productPrice: {
    fontSize: 11,
    fontWeight: 'bold',
    marginRight: 3,
    color: '#030A8C', // Cambiar el color a azul
    textAlign: 'right', // Alinear el texto a la derecha
  },
  productUnits: {
    fontSize: 12,
    marginLeft: 2,
    marginBottom: 3,
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
    zIndex: 1, // Asegura que los resultados de la búsqueda estén por encima de todo
  },
});

export default HomeScreen;


    
  }
});

export default HomeScreen;

