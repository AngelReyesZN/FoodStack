import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useFavoritos } from './FavoritesContext.jsx'; // Importa el contexto

const MainProductCard = ({ product, onAddToCart, onCardPress }) => {
  const { toggleFavorito, favoritos } = useFavoritos(); // Obtén la función del contexto y la lista de favoritos
  const [isFavorite, setIsFavorite] = useState(false);

  // Actualiza el estado si `favoritos` cambia
  useEffect(() => {
    setIsFavorite(favoritos.some((item) => item.id === product.id));
  }, [favoritos, product.id]);

  const handleFavoritePress = () => {
    toggleFavorito(product); // Alterna el estado de favorito
  };

  return (
    <TouchableOpacity onPress={onCardPress} style={styles.card}>
      <View style={styles.imageContainer}>
        <Image source={{ uri: product.imagen }} style={styles.image} />
        <TouchableOpacity
          onPress={handleFavoritePress}
          style={[
            styles.favoriteButton,
            isFavorite ? styles.favoriteButtonSelected : styles.favoriteButtonUnselected
          ]}
        >
          <Icon name="heart" size={18} color={isFavorite ? 'white' : '#D9D9D9'} />
        </TouchableOpacity>
      </View>
      <View style={styles.detailsContainer}>
        <Text style={styles.title}>{product.nombre}</Text>
        <Text style={styles.descripcion}>
          {product.descripcion.substring(0, 20)}{product.descripcion.length > 20 ? '...' : ''}
        </Text>
      </View>
      <View style={styles.bottomContainer}>
        <Text style={styles.price}>${product.precio}</Text>
        <TouchableOpacity onPress={onAddToCart} style={styles.button}>
          <Text style={styles.buttonText}>Agregar</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 0,
    paddingTop: 0,
    margin: 10,
    alignItems: 'flex-start',
    width: 155,
    height: 260,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    overflow: 'hidden', 
  },
  imageContainer: {
    position: 'relative',
    width: '100%', 
  },
  image: {
    width: '100%', 
    height: 150,
    resizeMode: 'cover',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  favoriteButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    borderRadius: 15,
    padding: 5,
  },
  favoriteButtonSelected: {
    backgroundColor: '#FF6347',
  },
  favoriteButtonUnselected: {
    backgroundColor: 'white',
    borderColor: '#ccc',
    borderWidth: 1,
  },
  title: {
    fontWeight: 'bold',
    fontSize: 16,
    marginTop: 4,
  },
  price: {
    color: '#FF6347',
    fontWeight: 'bold',
    fontSize: 16,
  },
  descripcion: {
    fontSize: 12,
    marginTop: 4,
  },
  button: {
    backgroundColor: '#FF6347',
    padding: 10,
    paddingHorizontal: 15,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'white',
  },
  detailsContainer: {
    padding: 10,
    paddingTop: 4,
    alignItems: 'flex-start',
  },
  bottomContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 10,
    marginTop: 4,
  },
});

export default MainProductCard;
