import React, { useEffect } from 'react';
import { View, Image, Animated } from 'react-native';

import Logo from '../assets/FoodStackLogo.png';

export default function LoadScreen({ navigation }) {
  const scaleValue = new Animated.Value(0);

  useEffect(() => {
    Animated.timing(scaleValue, {
      toValue: 1,
      duration: 1200, // Duración
      useNativeDriver: true,
    }).start(() => {
      // Reemplazar la pantalla actual para que no sea accesible desde el back button
      navigation.replace('Welcome');
    });
  }, []);

  const scale = scaleValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.5, 1], // Cambiar el tamaño de 0.5 a 1
  });

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FF6347' }}>
      <Animated.Image source={Logo} style={{ width: 250, height: 250, transform: [{ scale }] }} />
    </View>
  );
}
