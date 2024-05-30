import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, TextInput, Button, Alert } from 'react-native';
import Checkbox from 'expo-checkbox';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { auth, db } from '../services/firebaseConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LoginScreen = ({ navigation }) => {
  const [isChecked, setChecked] = useState(false);
  const [expediente, setExpediente] = useState('');
  const [contraseña, setContraseña] = useState('');

  useEffect(() => {
    // Cargar los valores guardados al montar el componente
    const loadStoredValues = async () => {
      try {
        const storedExpediente = await AsyncStorage.getItem('expediente');
        const storedContraseña = await AsyncStorage.getItem('contraseña');
        const storedIsChecked = await AsyncStorage.getItem('isChecked');

        if (storedExpediente) setExpediente(storedExpediente);
        if (storedContraseña) setContraseña(storedContraseña);
        if (storedIsChecked) setChecked(storedIsChecked === 'true');
      } catch (error) {
        console.error("Error loading stored values:", error);
      }
    };

    loadStoredValues();
  }, []);

  const handleLogin = async () => {
    try {
      // Buscar al usuario por expediente en Firestore
      const usersRef = collection(db, 'usuarios');
      const q = query(usersRef, where('expediente', '==', Number(expediente)));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const userDoc = querySnapshot.docs[0];
        const userEmail = userDoc.data().correo;

        // Iniciar sesión con el correo electrónico y la contraseña
        const userCredential = await signInWithEmailAndPassword(auth, userEmail, contraseña);
        const user = userCredential.user;

        // Verificar si el correo está verificado
        if (!user.emailVerified) {
          Alert.alert('Error', 'Por favor, verifica tu correo electrónico antes de iniciar sesión.');
          return;
        }

        // Guardar los valores si el checkbox está marcado
        if (isChecked) {
          await AsyncStorage.setItem('expediente', expediente);
          await AsyncStorage.setItem('contraseña', contraseña);
          await AsyncStorage.setItem('isChecked', 'true');
        } else {
          await AsyncStorage.removeItem('expediente');
          await AsyncStorage.removeItem('contraseña');
          await AsyncStorage.setItem('isChecked', 'false');
        }

        navigation.navigate('Home');
      } else {
        Alert.alert('Error', 'Expediente no encontrado');
      }
    } catch (error) {
      Alert.alert('Error', 'Usuario y/o contraseña incorrectos');
      console.error("Error al iniciar sesión:", error);
    }
  };

  const handleForgotPassword = async () => {
    if (!expediente) {
      Alert.alert('Error', 'Por favor, introduce tu expediente.');
      return;
    }

    try {
      // Buscar al usuario por expediente en Firestore
      const usersRef = collection(db, 'usuarios');
      const q = query(usersRef, where('expediente', '==', Number(expediente)));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const userDoc = querySnapshot.docs[0];
        const userEmail = userDoc.data().correo;

        await sendPasswordResetEmail(auth, userEmail);
        Alert.alert('Éxito', 'Se ha enviado un correo para restablecer su contraseña.');
      } else {
        Alert.alert('Error', 'Expediente no encontrado');
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo enviar el correo para restablecer la contraseña');
      console.error("Error al enviar el correo de restablecimiento de contraseña:", error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Image
          source={require('../assets/Logo.png')} // Cambia esto por la ruta real de tu logo
          style={styles.logo}
        />
      </View>
      <View style={styles.contentContainer}>
        <Text style={styles.title}>Bienvenido</Text>
        <Text style={styles.subtitle}>Introduce tus datos debajo</Text>
        <Text style={styles.labelUser}>Expediente</Text>
        <TextInput
          style={styles.inputField}
          value={expediente}
          onChangeText={text => setExpediente(text)}
          keyboardType="numeric"
        />
        <Text style={styles.labelpassword}>Contraseña</Text>
        <TextInput
          style={styles.inputField}
          value={contraseña}
          onChangeText={text => setContraseña(text)}
          secureTextEntry={true}
        />
        <View style={styles.checkboxContainer}>
          <Checkbox style={styles.checkbox} value={isChecked} onValueChange={setChecked} />
          <Text style={styles.checkboxLabel}>Recordarme</Text>
          <TouchableOpacity onPress={handleForgotPassword}>
            <Text style={styles.forgotPasswordText}>Contraseña olvidada?</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.buttonContainer}>
          <Button
            title="Iniciar"
            color="#030A8C"
            onPress={handleLogin}
          />
          <View style={styles.orContainer}>
            <View style={styles.line}></View>
            <Text style={styles.orText}>o inicia con</Text>
            <View style={styles.line}></View>
          </View>
          <View style={styles.socialContainer}>
            <TouchableOpacity style={[styles.socialButton, { backgroundColor: '#0910A6' }]} onPress={() => {}}>
              <Image source={require('../assets/google.png')} style={styles.logoImage} />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.socialButton, { backgroundColor: '#4145A6' }]} onPress={() => {}}>
              <Image source={require('../assets/facebook.png')} style={styles.logoImage} />
            </TouchableOpacity>
          </View>
          <View style={styles.registerContainer}>
            <Text style={styles.registerText}>No tienes cuenta? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Regis')}>
              <Text style={[styles.registerText, { color: '#030A8C' }]}>Regístrate</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#030A8C',
  },
  logoContainer: {
    backgroundColor: '#030A8C',
    width: '100%',
    padding: 15,
    paddingTop: 35,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 125,
    height: 125,
  },
  contentContainer: {
    flex: 1,
    backgroundColor: '#ffff',
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
    alignItems: 'center',
    paddingTop: 20,
  },
  title: {
    fontSize: 35,
    fontWeight: 'bold',
    color: 'black',
  },
  subtitle: {
    fontSize: 16,
    color: 'black',
    marginTop: 5,
  },
  labelUser: {
    alignSelf: 'flex-start',
    marginLeft: 20,
    marginTop: 25,
    fontSize: 15,
    color: '#000',
    marginBottom: 5,
  },
  labelpassword: {
    alignSelf: 'flex-start',
    marginLeft: 20,
    marginTop: 8,
    fontSize: 15,
    color: '#000',
    marginBottom: 5,
  },
  inputField: {
    height: 40,
    marginTop: 5,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#ccc',
    paddingLeft: 10,
    borderRadius: 5,
    width: '90%',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 0,
    marginLeft: 20,
  },
  checkbox: {
    alignSelf: 'center',
    borderColor: 'gray',
  },
  checkboxLabel: {
    marginLeft: 8,
    fontSize: 16,
    color: 'gray',
    flex: 1,
  },
  forgotPasswordText: {
    color: '#1a0dab',
    alignSelf: 'flex-end',
    marginRight: 20,
    marginTop: 8,
  },
  buttonContainer: {
    width: '90%',
    marginTop: 20,
  },
  orContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  line: {
    borderBottomWidth: 1,
    borderBottomColor: 'gray',
    width: '40%',
    flex: 1,
  },
  orText: {
    marginHorizontal: 10,
    color: 'gray',
  },
  socialContainer: {
    flexDirection: 'row',
    marginTop: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  socialButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#DDDDDD',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 10,
  },
  logoImage: {
    width: 21,
    height: 21,
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  registerText: {
    color: 'black',
    fontSize: 16,
  },
});

export default LoginScreen;
