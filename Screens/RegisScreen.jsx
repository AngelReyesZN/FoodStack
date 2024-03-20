import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet, Text, TouchableOpacity, Image } from 'react-native';

const Registro = ({ navigation }) => {
  const [nombreUsuario, setNombreUsuario] = useState('');
  const [telefono, setTelefono] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [confirmarContrasena, setConfirmarContrasena] = useState('');

  const handleRegistro = () => {
    // Verificar si las contraseñas son iguales
    if (contrasena !== confirmarContrasena) {
      alert('Las contraseñas no coinciden');
      return;
    }

    // Verificar si el número de teléfono tiene 10 dígitos
    if (telefono.length !== 10) {
      alert('El número de teléfono debe tener 10 dígitos');
      return;
    }

    // Si pasa todas las validaciones, navega a la pantalla de Verificar
    navigation.navigate('Verify', { telefono: telefono });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Registro</Text>
      <Text style={styles.subtitle}>Completa tu registro introduciendo{'\n'}los siguientes datos</Text>

      <Text style={styles.label}>Nombre de usuario</Text>
      <TextInput 
        value={nombreUsuario}
        onChangeText={setNombreUsuario}
        style={styles.input}
      />

      <Text style={styles.label}>Teléfono</Text>
      <TextInput 
        value={telefono}
        onChangeText={setTelefono}
        style={styles.input}
        keyboardType="numeric"
      />

      <Text style={styles.label}>Contraseña</Text>
      <TextInput 
        value={contrasena}
        onChangeText={setContrasena}
        style={styles.input}
        secureTextEntry
      />

      <Text style={styles.label}>Confirmar contraseña</Text>
      <TextInput 
        value={confirmarContrasena}
        onChangeText={setConfirmarContrasena}
        style={styles.input}
        secureTextEntry
      />

      <View style={styles.buttonContainer}>
        <Button title="Registrar" onPress={handleRegistro} color="#030A8C" />
        <View style={styles.orContainer}>
          <View style={styles.line}></View>
          <Text style={styles.orText}>o inicia con</Text>
          <View style={styles.line}></View>
        </View>
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
        <Text style={styles.registerText}>Tienes cuenta? </Text>
        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text style={[styles.registerText, { color: '#030A8C' }]}>Inicia sesión</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    alignItems: 'center',
  },
  title: {
    fontSize: 25,
    fontWeight: 'bold',
    color: 'black',
  },
  subtitle: {
    fontSize: 15,
    color: 'black',
    textAlign: 'center',
    marginTop: 5,
    marginBottom: 10,
  },
  label: {
    alignSelf: 'flex-start',
    marginLeft: 20,
    marginTop: 8,
    fontSize: 15,
    color: '#000',
    marginBottom: 5, // Agrega un poco de espacio debajo del nombre de usuario
  },
  
  input: {
    height: 40,
    marginTop: 5,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    paddingLeft: 10,
    borderRadius: 5,
    width: '90%',
  },
  buttonContainer: {
    width: '90%',
    marginTop: 15,
  },
  orContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  line: {
    borderBottomWidth: 1,
    borderBottomColor: 'gray',
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
    marginTop: 15,
  },
  registerText: {
    color: 'black',
    fontSize: 16,
  },
});

export default Registro;
