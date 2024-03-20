import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet, Text, TouchableOpacity, Image } from 'react-native';

const Verify = ({ route, navigation }) => {
  const telefono = route.params?.telefono;
  const [inputText1, setInputText1] = useState('');
  const [inputText2, setInputText2] = useState('');
  const [inputText3, setInputText3] = useState('');
  const [inputText4, setInputText4] = useState('');

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Verificación</Text>
      <Text style={styles.subtitle}>
        Ingresa el código de verificación{'\n'}enviado al  
        <Text style={styles.bold}> +52 {telefono?.substring(0, 6)}****</Text>
      </Text>
      <Text style={styles.label}>Código de verificación</Text>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={inputText1}
          onChangeText={setInputText1}
          fontSize={30}
          keyboardType="numeric"
          maxLength={1}
          textAlign="center"
          // Ajuste horizontal del texto
          paddingLeft={5}
          paddingRight={5}
        />
        <TextInput
          style={styles.input}
          value={inputText2}
          onChangeText={setInputText2}
          fontSize={30}
          keyboardType="numeric"
          maxLength={1}
          textAlign="center"
          // Ajuste horizontal del texto
          paddingLeft={5}
          paddingRight={5}
        />
        <TextInput
          style={styles.input}
          value={inputText3}
          onChangeText={setInputText3}
          fontSize={30}
          keyboardType="numeric"
          maxLength={1}
          textAlign="center"
          // Ajuste horizontal del texto
          paddingLeft={5}
          paddingRight={5}
        />
        <TextInput
          style={styles.input}
          value={inputText4}
          onChangeText={setInputText4}
          fontSize={30}
          keyboardType="numeric"
          maxLength={1}
          textAlign="center"
          // Ajuste horizontal del texto
          paddingLeft={5}
          paddingRight={5}
        />
      </View>
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.cancelButton}>
          <Text style={styles.cancelButtonText}>Cancelar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.verifyButton} onPress={() => navigation.navigate('Successful')}>
          <Text style={styles.verifyButtonText}>Verificar código</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.registerContainer}>
        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text style={[styles.registerText, { color: '#030A8C' }]}>Reenviar código</Text>
        </TouchableOpacity>
        </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  title: {
    fontSize: 25,
    fontWeight: 'bold',
    color: 'black',
    alignItems: 'center',
    textAlign: 'center',
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
    marginTop: 20,
    fontSize: 15,
    color: '#000',
    marginBottom: 5,
  },
  inputContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    marginLeft: '4%',
    marginRight: '4%',
  },
  input: {
    flex: 1,
    height: 70,
    marginLeft: 5,
    marginRight: 5,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    textAlignVertical: 'center',
  },
  bold: {
    fontWeight: 'bold',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 30,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: '5%', // Ajuste al 5% del ancho de la pantalla
    marginRight: '1%', // Espacio entre los botones
    marginLeft: '5%',

  },
  verifyButton: {
    flex: 1,
    backgroundColor: '#030A8C',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: '5%', // Ajuste al 5% del ancho de la pantalla
    marginLeft: '1%', // Espacio entre los botones
    marginRight: '5%',
  },
  cancelButtonText: {
    color: 'black',
    textAlign: 'center',
  },
  verifyButtonText: {
    color: 'white',
    textAlign: 'center',
  },
  registerContainer: {
    flexDirection: 'row',
    marginTop: 15,
    marginLeft: '5%',
    paddingTop: 15,
  },
  registerText: {
    color: 'black',
    fontSize: 16,
  },
});

export default Verify;
