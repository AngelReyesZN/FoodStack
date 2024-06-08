import React, { useEffect } from 'react';
import { View, Image, Text, Animated, StyleSheet } from 'react-native';

import Logo from '../assets/rscMenu/LoadProduct.png';

export default function LoadProductScreen({ navigation }) {
  const scaleValue = new Animated.Value(0);

  useEffect(() => {
    Animated.timing(scaleValue, {
      toValue: 1,
      duration: 1200, // Duración
      useNativeDriver: true,
    }).start(() => {
      // Navegar a la pantalla de inicio de sesión después de que la animación haya terminado
      navigation.navigate('Home');
    });
  }, []);

  const scale = scaleValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.5, 1], // Cambiar el tamaño de 0.5 a 1
  });

  return (
    <View style={styles.container}>
      <Animated.Image source={Logo} style={[styles.logo, { transform: [{ scale }] }]} />
      <Text style={styles.text}>¡Tu producto ha sido publicado!</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#030A8C',
  },
  logo: {
    width: 350,
    height: 450,
  },
  text: {
    marginTop: 5,
    padding: 20,
    fontSize: 36,
    textAlign: 'center',
    alignItems: 'center',
    color: '#fff',
    
  },
});