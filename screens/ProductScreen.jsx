import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import SearchBar from '../components/SearchBar';
import BottomMenuBar from '../components/BottomMenuBar';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useNavigation } from '@react-navigation/native';
import SellerImage from '../assets/rscMenu/profileUser.png'; // Importar la imagen del vendedor
import BotonMenos from '../assets/rscMenu/BotonMenos.png'; // Importar imagen del botón de menos
import BotonMas from '../assets/rscMenu/BotonMas.png'; // Importar imagen del botón de más
import BotonImagen from '../assets/rscMenu/BotonImagen.png'; // Importar imagen del botón de imagen
import BackButton from '../components/BackButton.jsx'

const ProductScreen = ({ route }) => {
    const { product, isFavorite: initialIsFavorite } = route.params; // Obtener el estado de favorito de los parámetros de la ruta
    const [quantity, setQuantity] = useState(1); // Estado para la cantidad
    const [isFavorite, setIsFavorite] = useState(initialIsFavorite); // Inicializar el estado de favorito con el valor inicial
    const navigation = useNavigation();
  
    // Función para restar la cantidad
    const decreaseQuantity = () => {
      if (quantity > 1) {
        setQuantity(quantity - 1);
      }
    };
  
    // Función para sumar la cantidad
    const increaseQuantity = () => {
      setQuantity(quantity + 1);
    };
  
    // Función para alternar el estado de favorito
    const toggleFavorite = () => {
      setIsFavorite(!isFavorite);
    };
  
    return (
      <View style={styles.container}>
        <SearchBar />
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <BackButton/>
        </TouchableOpacity>
        <Text style={styles.category}>{product.categoria}</Text>
        <Text style={styles.name}>{product.nombre}</Text>
        <Image source={{ uri: product.imagen }} style={styles.image} />
        <View style={styles.sellerContainer}>
          <Image source={SellerImage} style={styles.sellerImage} />
          <View style={styles.sellerInfo}>
            <Text style={styles.sellerName}>{product.vendedor.nombre}</Text>
            <View style={styles.ratingContainer}>
              <Text style={styles.ratingText}>4.5</Text>
              <Icon name="star" size={18} color="#030A8C" style={styles.starIcon} />
            </View>
          </View>
        </View>
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={decreaseQuantity}>
            <Image source={BotonMenos} style={styles.buttonIcon} />
          </TouchableOpacity>
          <Text style={styles.quantity}>{quantity}</Text>
          <TouchableOpacity style={styles.button} onPress={increaseQuantity}>
            <Image source={BotonMas} style={styles.buttonIcon} />
          </TouchableOpacity>
          <Text style={styles.price}>${product.precio}.00</Text>
        </View>
        {/* Botón de imagen y botón de favoritos */}
        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.imageButton}>
            <Image source={BotonImagen} style={styles.imageButtonIcon} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.favoriteButton} onPress={toggleFavorite}>
            <Icon 
            name={isFavorite ? 'heart' : 'heart-o'} 
            size={27} 
            color={isFavorite ? '#e82d2d' : '#030A8C'} 
            style={[styles.favoriteIcon]}/>
          </TouchableOpacity>
        </View>
        <BottomMenuBar />
      </View>
    );
  };

const styles = StyleSheet.create({
    container: {
      flex: 1,
      paddingTop: 20,
      backgroundColor: 'white',
      position: 'relative', // Añadido para establecer un contexto de posicionamiento
    },
    backButton: {
      marginRight: 10,
      paddingTop: 10,
      paddingLeft: 15,
    },
    category: {
      fontSize: 22,
      textAlign: 'center',
      marginTop: 10,
      color: '#030A8C',
    },
    name: {
      fontSize: 30,
      textAlign: 'center',
      marginVertical: 10,
    },
    image: {
      width: '100%',
      height: 300,
      resizeMode: 'contain',
      alignSelf: 'center',
    },
    sellerContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-start',
      marginVertical: 20,
      paddingLeft: 30,
    },
    sellerImage: {
      width: 40,
      height: 40,
      borderRadius: 20,
      marginRight: 10,
    },
    sellerInfo: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    sellerName: {
      fontSize: 20,
      textDecorationLine: 'underline',
      marginRight: 10,
    },
    ratingContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginLeft: 90,
    },
    ratingText: {
      fontSize: 20,
      marginRight: 5,
    },
    starIcon: {
      marginTop: 1,
    },
    buttonContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-start',
      marginVertical: 10,
      paddingLeft: 30,
    },
    button: {
      width: 50,
      height: 40,
      justifyContent: 'center',
      alignItems: 'center',
      marginHorizontal: 0,
    },
    buttonIcon: {
      width: 35,
      height: 35,
    },
    quantity: {
      fontSize: 20,
      fontWeight: 'bold',
      marginHorizontal: 10,
    },
    price: {
      fontSize: 22,
      color: '#030A8C',
      marginLeft: 120, // Mantenido el margen izquierdo
    },
    units: {
      fontSize: 18,
      color: '#666',
      textAlign: 'center',
      marginVertical: 5,
    },
    description: {
      fontSize: 16,
      color: '#444',
      textAlign: 'center',
      marginVertical: 10,
    },
    imageButton: {
      width: '70%', // Mantenido el ancho original
      height: 40,
      backgroundColor: '#030A8C',
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 10,
      marginLeft: 30, // Agregado margen izquierdo para separar del borde izquierdo
    },
    imageButtonIcon: {
      width: 25,
      height: 25,
    },
    favoriteButton: {
        position: 'absolute',
        top: 3,
        right: 45,
        borderWidth: 1,
        borderColor: '#D6DBDE',
        borderRadius: 6,
      },
      favoriteIcon: {
        margin: 3, // Agrega este margen derecho para separar el borde del icono de corazón
      },
    
  });

export default ProductScreen;
