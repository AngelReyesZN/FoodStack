import React, { useEffect } from 'react';
import { View, Image, Animated, Text } from 'react-native';

import successful from '../assets/successful.png';

export default function SuccessfulScreen({ navigation }) {
  const scaleValue = new Animated.Value(0);

  useEffect(() => {
    Animated.timing(scaleValue, {
      toValue: 1,
      duration: 1000, // Duración de 3 segundos
      useNativeDriver: true,
    }).start(() => {
      // Navegar a la pantalla de inicio de sesión después de que la animación haya terminado
      navigation.navigate('Login');
    });
  }, []);

  const scale = scaleValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.75, 1], // Cambiar el tamaño de 0.5 a 1
  });

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#030A8C' }}>
      <Animated.Image source={successful} style={{ width: 200, height: 200, transform: [{ scale }] }} />
      <Text style={{ color: 'white', fontWeight: 'bold', marginTop: 20, fontSize: 30 }}>¡Registro Exitoso!</Text>
    </View>
  );
}
