import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, TextInput, Button, Alert } from 'react-native';
import Checkbox from 'expo-checkbox';
import registros from './data';

const LoginScreen = ({ navigation }) => {
  const [isChecked, setChecked] = useState(false);
  const [nombreUsuario, setNombreUsuario] = useState('');
  const [contraseña, setContraseña] = useState('');

  const handleLogin = () => {
    console.log("Nombre de usuario:", nombreUsuario);
    console.log("Contraseña:", contraseña);
    
    const usuario = registros.find(registro => registro.nombre === nombreUsuario && registro.correo === contraseña);
    console.log("Usuario encontrado:", usuario);
  
    if (usuario) {
      navigation.navigate('Home');
    } else {
      Alert.alert('Error', 'Usuario y/o contraseña incorrectos');
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

      {/* View con fondo blanco para el contenido debajo del logo */}
      <View style={styles.contentContainer}>
        <Text style={styles.title}>Bienvenido</Text>
        <Text style={styles.subtitle}>Introduce tus datos debajo</Text>

        <Text style={styles.labelUser}>Nombre de usuario</Text>
        <TextInput 
          style={styles.inputField} 
          value={nombreUsuario}
          onChangeText={text => setNombreUsuario(text)} // Actualiza el estado nombreUsuario
        />

        <Text style={styles.labelpassword}>Contraseña</Text>
        <TextInput 
          style={styles.inputField}
          value={contraseña}
          onChangeText={text => setContraseña(text)} // Actualiza el estado contraseña
          secureTextEntry={true}
        />

        {/* CheckBox y texto "Recordarme" */}
        <View style={styles.checkboxContainer}>
          <Checkbox style={styles.checkbox} value={isChecked} onValueChange={setChecked} />
          <Text style={styles.checkboxLabel}>Recordarme</Text>
          <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
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
            <TouchableOpacity style={[styles.socialButton, { backgroundColor: '#0910A6' }]} onPress={() => {/* Acción al presionar el botón de Google */}}>
              <Image source={require('../assets/google.png')} style={styles.logoImage}/>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.socialButton, { backgroundColor: '#4145A6' }]} onPress={() => {/* Acción al presionar el botón de Facebook */}}>
              <Image source={require('../assets/facebook.png')} style={styles.logoImage}/>
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
    padding: 15, // Ajusta este valor según necesites
    paddingTop: 35,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 125, // Ajusta el tamaño según necesites
    height: 125, // Ajusta el tamaño según necesites
  },
  contentContainer: {
    flex: 1,
    backgroundColor: '#ffff',
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
    alignItems: 'center',
    paddingTop: 20, // Agrega un poco de espacio en la parte superior
  },
  title: {
    fontSize: 35,
    fontWeight: 'bold',
    color: 'black',
  },
  subtitle: {
    fontSize: 16,
    color: 'black',
    marginTop: 5, // Espacio entre el título y el subtítulo
  },
  labelUser: {
    alignSelf: 'flex-start',
    marginLeft: 20,
    marginTop: 25,
    fontSize: 15,
    color: '#000',
    marginBottom: 5, // Agrega un poco de espacio debajo del nombre de usuario
  },
  labelpassword: {
    alignSelf: 'flex-start',
    marginLeft: 20,
    marginTop: 8,
    fontSize: 15,
    color: '#000',
    marginBottom: 5, // Agrega un poco de espacio debajo de la contraseña
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
    marginLeft: 20, // Mueve el CheckBox a la izquierda
  },
  checkbox: {
    alignSelf: 'center',
    borderColor: 'gray',
  },
  checkboxLabel: {
    marginLeft: 8,
    fontSize: 16,
    color: 'gray',
    flex: 1, // Para que ocupe todo el espacio disponible
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
