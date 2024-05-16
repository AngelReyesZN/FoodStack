import React, { useState, useRef } from 'react';
import { View, TextInput, Button, StyleSheet, Text, TouchableOpacity, Image } from 'react-native';

const Verify = ({ route, navigation }) => {
  const telefono = route.params?.telefono;
  const [inputText1, setInputText1] = useState('');
  const [inputText2, setInputText2] = useState('');
  const [inputText3, setInputText3] = useState('');
  const [inputText4, setInputText4] = useState('');
  const inputRef2 = useRef(null);
  const inputRef3 = useRef(null);
  const inputRef4 = useRef(null);

  const handleKeyPress1 = () => {
    inputRef2.current.focus();
  };

  const handleKeyPress2 = () => {
    inputRef3.current.focus();
  };

  const handleKeyPress3 = () => {
    inputRef4.current.focus();
  };

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
          onChangeText={(text) => {
            setInputText1(text);
            if (text.length === 1) {
              handleKeyPress1();
            }
          }}
          fontSize={30}
          keyboardType="numeric"
          maxLength={1}
          textAlign="center"
        />
        <TextInput
          style={styles.input}
          value={inputText2}
          onChangeText={(text) => {
            setInputText2(text);
            if (text.length === 1) {
              handleKeyPress2();
            }
          }}
          fontSize={30}
          keyboardType="numeric"
          maxLength={1}
          textAlign="center"
          ref={inputRef2}
        />
        <TextInput
          style={styles.input}
          value={inputText3}
          onChangeText={(text) => {
            setInputText3(text);
            if (text.length === 1) {
              handleKeyPress3();
            }
          }}
          fontSize={30}
          keyboardType="numeric"
          maxLength={1}
          textAlign="center"
          ref={inputRef3}
        />
        <TextInput
          style={styles.input}
          value={inputText4}
          onChangeText={setInputText4}
          fontSize={30}
          keyboardType="numeric"
          maxLength={1}
          textAlign="center"
          ref={inputRef4}
        />
      </View>
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.cancelButton}>
          <Text style={styles.cancelButtonText}>Cancelar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.verifyButton} onPress={() => navigation.navigate('successful')}>
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
    paddingHorizontal: '5%',
    marginRight: '1%',
    marginLeft: '5%',
  },
  verifyButton: {
    flex: 1,
    backgroundColor: '#030A8C',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: '5%',
    marginLeft: '1%',
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
