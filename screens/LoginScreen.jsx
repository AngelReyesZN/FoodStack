import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, TextInput, Button, Dimensions  } from 'react-native';
import Checkbox from 'expo-checkbox';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { auth, db } from '../services/firebaseConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ErrorAlert from '../components/ErrorAlert'; // Importa el componente de alerta personalizado
import CustomText from '../components/CustomText';

const LoginScreen = ({ navigation }) => {
  const [isChecked, setChecked] = useState(false);
  const [expediente, setExpediente] = useState('');
  const [contraseña, setContraseña] = useState('');
  const [error, setError] = useState(''); // Estado para el mensaje de error

  useEffect(() => {
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
      const usersRef = collection(db, 'usuarios');
      const q = query(usersRef, where('expediente', '==', Number(expediente)));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const userDoc = querySnapshot.docs[0];
        const userEmail = userDoc.data().correo;

        const userCredential = await signInWithEmailAndPassword(auth, userEmail, contraseña);
        const user = userCredential.user;

        if (!user.emailVerified) {
          setError('Por favor, verifica tu correo electrónico antes de iniciar sesión.');
          return;
        }

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
        setError('Expediente no encontrado');
      }
    } catch (error) {
      setError('Usuario y/o contraseña incorrectos');
      console.error("Error al iniciar sesión:", error);
    }
  };

  const handleForgotPassword = async () => {
    if (!expediente) {
      setError('Por favor, introduce tu expediente.');
      return;
    }

    try {
      const usersRef = collection(db, 'usuarios');
      const q = query(usersRef, where('expediente', '==', Number(expediente)));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const userDoc = querySnapshot.docs[0];
        const userEmail = userDoc.data().correo;

        await sendPasswordResetEmail(auth, userEmail);
        Alert.alert('Éxito', 'Se ha enviado un correo para restablecer su contraseña.');
      } else {
        setError('Expediente no encontrado');
      }
    } catch (error) {
      setError('No se pudo enviar el correo para restablecer la contraseña');
      console.error("Error al enviar el correo de restablecimiento de contraseña:", error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Image
          source={require('../assets/FoodStackLogo.png')}
          style={styles.logo}
        />
      </View>
      <View style={styles.contentContainer}>
        <CustomText style={styles.title}  fontWeight="Bold">Iniciar sesión</CustomText>
        <CustomText style={styles.subtitle} fontWeight="Medium">Introduce tus datos en los campos asignados.</CustomText>
        {error && (
        <ErrorAlert
          message={error}
          onClose={() => setError('')}
        />
      )}
        <CustomText style={styles.labelUser}  fontWeight="Medium">Expediente</CustomText>
        <TextInput
          style={styles.inputField}
          value={expediente}
          onChangeText={text => setExpediente(text)}
          keyboardType="numeric"
        />
        <CustomText style={styles.labelpassword}  fontWeight="Medium">Contraseña</CustomText>
        <TextInput
          style={styles.inputField}
          value={contraseña}
          onChangeText={text => setContraseña(text)}
          secureTextEntry={true}
        />
        <View style={styles.checkboxContainer}>
          <Checkbox  color="#FF6347" style={styles.checkbox} value={isChecked} onValueChange={setChecked} />
          <CustomText style={styles.checkboxLabel}  fontWeight="SemiBold">Recordarme</CustomText>
          <TouchableOpacity onPress={handleForgotPassword}>
            <CustomText style={styles.forgotPasswordText} fontWeight="Medium">¿Contraseña olvidada?</CustomText>
          </TouchableOpacity>
        </View>
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
            <Text  style={styles.loginButtonLabel}>Iniciar</Text>
          </TouchableOpacity>
          <View style={styles.orContainer}>
            <View style={styles.line}></View>
            <CustomText style={styles.orText}>o inicia con</CustomText>
            <View style={styles.line}></View>
          </View>
          <View style={styles.socialContainer}>
            <TouchableOpacity style={[styles.socialButton, { backgroundColor: '#C62A0E' }]} onPress={() => {}}>
              <Image source={require('../assets/google.png')} style={styles.logoImage} />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.socialButton, { backgroundColor: '#ED3615' }]} onPress={() => {}}>
              <Image source={require('../assets/facebook.png')} style={styles.logoImage} />
            </TouchableOpacity>
          </View>
          <View style={styles.registerContainer}>
            <CustomText style={styles.registerText}>¿No tienes cuenta? </CustomText>
            <TouchableOpacity onPress={() => navigation.navigate('Regis')}>
              <CustomText style={[styles.registerText, { color: '#FF6347' }]}>Regístrate</CustomText>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
};

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FF6347',
  },
  tilin: {
    textAlign: 'left',
    color: 'red',
    fontSize: 20,
  },
  logoContainer: {
    backgroundColor: '#FF6347',
    width: '100%',
    height: height * 0.25, // Responsivo en función del alto de la pantalla
    padding: 15,
    paddingTop: height * 0.05, // Espaciado dinámico basado en el alto
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: width * 0.3,  // Logotipo que se ajusta al ancho de la pantalla
    height: width * 0.3,
  },
  contentContainer: {
    flex: 1,
    backgroundColor: '#fff',
    borderTopLeftRadius: 35,
    borderTopRightRadius: 35,
    alignItems: 'center',
    paddingTop: height * 0.02, // Padding dinámico
  },
  title: {
    fontSize: 34,  
    color: 'black', 
  },
  subtitle: {
    fontSize: 16,
    color: 'black',
    marginTop: 5,
    paddingLeft: width * 0.02, // Padding dinámico
    paddingRight: width * 0.02, // Padding dinámico
    textAlign: 'center',

  },
  labelUser: {
    alignSelf: 'flex-start',
    marginLeft: width * 0.05, 
    marginTop: height * 0.03,
    fontSize: 14,
    color: '#6E6E6E',
    marginBottom: height * 0.01,
  },
  labelpassword: {
    alignSelf: 'flex-start',
    marginLeft: width * 0.05,
    marginTop: height * 0.01,
    fontSize: 14,
    color: '#6E6E6E',
    marginBottom: height * 0.01,
  },
  inputField: {
    height: height * 0.05,
    marginTop: height * 0.01,
    marginBottom: height * 0.025,
    borderWidth: 1,
    borderColor: '#ccc',
    paddingLeft: 10,
    borderRadius: 5,
    width: '90%', // Ocupa el 90% del ancho del contenedor,
    fontFamily: 'Montserrat-Medium',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: height * 0.01,
    marginLeft: width * 0.05,
  },
  checkbox: {
    alignSelf: 'center',
    borderColor: 'gray',
  },
  checkboxLabel: {
    marginLeft: 8,
    fontSize: 14,
    color: '#575757',
    flex: 1,
  },
  loginButton: {
    marginTop: height * 0.015,
    marginBottom: height * 0.022,
    backgroundColor: '#FF6347',
    padding: height * 0.015,
    borderRadius: 10,
    width: '100%', 
    alignSelf: 'center',
  },
  loginButtonLabel: {
    color: 'white',
    textAlign: 'center',
  },
  forgotPasswordText: {
    color: '#FF6347',
    alignSelf: 'flex-end',
    marginRight: width * 0.05,
    marginTop: height * 0.01,
  },
  buttonContainer: {
    width: '90%',
    marginTop: height * 0.02,
  },
  orContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: height * 0.015,
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
    marginTop: height * 0.02,
    justifyContent: 'center',
    alignItems: 'center',
  },
  socialButton: {
    width: width * 0.15,  // Tamaño relativo basado en el ancho de la pantalla
    height: width * 0.15,
    borderRadius: width * 0.075, // Para mantener la forma circular
    backgroundColor: '#DDDDDD',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: width * 0.025,
  },
  logoImage: {
    width: width * 0.05,
    height: width * 0.05,
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginTop: height * 0.05,
  },
  registerText: {
    color: 'black',
    fontSize: 14,
  },
});

export default LoginScreen;
