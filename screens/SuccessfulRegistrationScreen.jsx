import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Image, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native'; // Importar el hook
import CustomText from '../components/CustomText';

const SuccessfulScreen = () => {
  const navigation = useNavigation(); // Usar el hook para obtener 'navigation'

  return (
    <View style={styles.container}>
      <Image source={require('../assets/check.png')} style={styles.check} />
      <CustomText style={styles.title} fontWeight="Bold">¡Registro exitoso!</CustomText>
      <CustomText style={styles.subtitle} fontWeight="Medium">Hemos enviado un correo de verificación{'\n'}para confirmar tu cuenta.</CustomText>
      <TouchableOpacity style={styles.signupButton} onPress={() => navigation.navigate('Login')}>
        <CustomText style={styles.signupButtonlabel} fontWeight="Bold">Iniciar sesión</CustomText>
      </TouchableOpacity>
    </View>
  );
};

const { width, height } = Dimensions.get('window');
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  title: {
    fontSize: 24,
    marginBottom: height * 0.05,
  },
  subtitle: {
    textAlign: 'center',
    fontSize: 15,
    marginBottom: height * 0.04,
  },
  check: {
    width: 162,
    height: 162,
    marginBottom: height * 0.05,
  },
  signupButton: {
    marginTop: height * 0.015,
    marginBottom: height * 0.02,
    backgroundColor: '#fff',
    padding: height * 0.015,
    borderRadius: 10,
    width: '80%',
    alignSelf: 'center',
    borderWidth: 2,
    borderColor: '#EA5F46',
  },
  signupButtonlabel: {
    color: '#EA5F46',
    textAlign: 'center',
    fontSize: 24,
  },
});

export default SuccessfulScreen;
