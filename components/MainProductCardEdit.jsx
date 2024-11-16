import React from 'react';
import { View, StyleSheet, Image, TouchableOpacity } from 'react-native';
import CustomText from '../components/CustomText';

const MainProductCardEdit = ({ product, onEditPress }) => {
  return (
    <View style={styles.card}>
      <View style={styles.imageContainer}>
        <Image source={{ uri: product.imagen }} style={styles.image} />
      </View>
      <View style={styles.detailsContainer}>
        <CustomText style={styles.title} fontWeight="Bold">
          {product.nombre.length > 14 ? product.nombre.substring(0, 14) : product.nombre}
        </CustomText>       
        <CustomText style={styles.descripcion}>
        {product.descripcion.substring(0, 14)}
        {product.descripcion.length > 14 ? '...' : ''}
        </CustomText>
      </View>
      <View style={styles.bottomContainer}>
        <CustomText style={styles.price} fontWeight="Medium">${product.precio}</CustomText>
        <TouchableOpacity style={styles.button} onPress={onEditPress}>
          <CustomText style={styles.buttonText} fontWeight="Medium">Editar</CustomText>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 0,
    margin: 10,
    alignItems: 'flex-start',
    width: '45%',
    height: 260,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
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
  title: {
    fontSize: 16,
    marginTop: 4,
  },
  price: {
    color: '#FF6347',
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

export default MainProductCardEdit;