import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';

const MainProductCard = ({ product, onAddToCart }) => {
  return (
    <View style={styles.card}>
      <Image source={{ uri: product.imagen }} style={styles.image} />
      <Text style={styles.title}>{product.nombre}</Text>
      <Text style={styles.price}>${product.precio}</Text>
      <Text style={styles.units}>Unidades: {product.cantidad}</Text>
      <TouchableOpacity onPress={onAddToCart} style={styles.button}>
        <Text style={styles.buttonText}>Add to cart</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 10,
    margin: 10,
    alignItems: 'center',
  },
  image: {
    width: 120,
    height: 120,
    borderRadius: 10,
  },
  title: {
    fontWeight: 'bold',
    fontSize: 16,
    marginTop: 8,
  },
  price: {
    color: 'gray',
    fontSize: 14,
    marginTop: 4,
  },
  units: {
    fontSize: 14,
    marginTop: 4,
  },
  button: {
    backgroundColor: '#f0c14b',
    width: 100,
    height: 30,
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default MainProductCard;