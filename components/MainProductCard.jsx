import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';

const MainProductCard = ({ product, onAddToCart }) => {
  return (
    <View style={styles.card}>
      <Image source={{ uri: product.imagen }} style={styles.image} />
      <View style={styles.detailsContainer}>
        <Text style={styles.title}>{product.nombre}</Text>
        <Text style={styles.descripcion}>{product.descripcion}</Text>
      </View>
      <View style={styles.bottomContainer}>
        <Text style={styles.price}>${product.precio}</Text>
        <TouchableOpacity onPress={onAddToCart} style={styles.button}>
          <Text style={styles.buttonText}>Agregar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 10,
    paddingTop: 0,
    margin: 10,
    alignItems: 'flex-start',

    width: 150,
    height: 260,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  image: {
    alignSelf: 'center',
    width: 150,
    height: 150,
    resizeMode: 'cover',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    borderBottomRightRadius: 0,
    borderBottomLeftRadius: 0,
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