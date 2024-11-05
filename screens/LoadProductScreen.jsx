import React, { useEffect } from 'react';
import { View, Image, Text, Animated, StyleSheet } from 'react-native';
import CustomText from '../components/CustomText';

import Logo from '../assets/rscMenu/checkProduct.png';

export default function LoadProductScreen({ navigation }) {
  const scaleValue = new Animated.Value(0); // Inicializa en 0

  useEffect(() => {
    Animated.spring(scaleValue, {
      toValue: 1, // Valor final de la escala
      friction: 4, // Controla la resistencia del rebote
      tension: 40, // Controla la velocidad de la animación
      duration: 5000, // Duración de 3 segundos
      useNativeDriver: true,
    }).start(() => {
      // Navegar a la pantalla de inicio después de la animación
      navigation.replace('Home');
    });
  }, []);

  const scale = scaleValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 1], // Empieza más pequeño para dar efecto de rebote
  });

  return (
    <View style={styles.container}>
      <Animated.Image source={Logo} style={[styles.logo, { transform: [{ scale }] }]} />
      <CustomText style={styles.text} fontWeight='Medium'>¡Tu producto ha sido publicado!</CustomText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FF6347',
  },
  logo: {
    width: 300,
    height: 228.25,
  },
  text: {
    marginTop: 5,
    padding: 20,
    fontSize: 31,
    textAlign: 'center',
    color: '#fff',
  },
});
