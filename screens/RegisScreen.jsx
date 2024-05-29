import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet, Text, TouchableOpacity, Image, ScrollView, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { collection, getDocs, query, where, doc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { db, auth, storage } from '../services/firebaseConfig'; // Asegúrate de tener configurado tu archivo de configuración de Firebase
import TopBar from '../components/TopBar';
import BackButton from '../components/BackButton';

const RegisScreen = ({ navigation }) => {
  const [expediente, setExpediente] = useState('');
  const [nombreUsuario, setNombreUsuario] = useState('');
  const [telefono, setTelefono] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [confirmarContrasena, setConfirmarContrasena] = useState('');
  const [image, setImage] = useState(null);
  const [correo, setCorreo] = useState('');

  const [errors, setErrors] = useState({});

  const handlePickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const validateField = (field, value) => {
    if (!value) {
      setErrors(prevErrors => ({ ...prevErrors, [field]: 'Este campo es obligatorio' }));
    } else {
      setErrors(prevErrors => {
        const { [field]: removed, ...rest } = prevErrors;
        return rest;
      });
    }
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setErrors(prevErrors => ({ ...prevErrors, correo: 'Correo no válido' }));
    } else {
      setErrors(prevErrors => {
        const { correo, ...rest } = prevErrors;
        return rest;
      });
    }
  };

  const validatePasswordLength = (password, field) => {
    if (password.length < 6) {
      setErrors(prevErrors => ({ ...prevErrors, [field]: 'La contraseña debe tener al menos 6 caracteres' }));
    } else {
      setErrors(prevErrors => {
        const { [field]: removed, ...rest } = prevErrors;
        return rest;
      });
    }
  };

  const handleRegistro = async () => {
    // Validar campos
    validateField('expediente', expediente);
    validateField('nombreUsuario', nombreUsuario);
    validateField('telefono', telefono);
    validateField('correo', correo);
    validateEmail(correo);
    validateField('contrasena', contrasena);
    validatePasswordLength(contrasena, 'contrasena');
    validateField('confirmarContrasena', confirmarContrasena);
    validatePasswordLength(confirmarContrasena, 'confirmarContrasena');

    // Verificar si hay errores
    if (Object.keys(errors).length > 0) {
      Alert.alert('Error', 'Por favor, completa todos los campos correctamente');
      return;
    }

    if (contrasena !== confirmarContrasena) {
      Alert.alert('Error', 'Las contraseñas no coinciden');
      return;
    }

    if (telefono.length !== 10) {
      Alert.alert('Error', 'El número de teléfono debe tener 10 dígitos');
      return;
    }

    try {
      // Verificar si el expediente ya existe en Firestore
      const usersCollectionRef = collection(db, 'usuarios');
      const expedienteQuery = query(usersCollectionRef, where('expediente', '==', Number(expediente)));
      const expedienteSnapshot = await getDocs(expedienteQuery);

      if (!expedienteSnapshot.empty) {
        Alert.alert('Error', 'El expediente ya existe');
        return;
      }

      const userCredential = await createUserWithEmailAndPassword(auth, correo, contrasena);
      const user = userCredential.user;

      await sendEmailVerification(user);

      let imageUrl = '';
      if (image) {
        const response = await fetch(image);
        const blob = await response.blob();
        const storageRef = ref(storage, `usuarios/${user.uid}-profile`);
        await uploadBytes(storageRef, blob);
        imageUrl = await getDownloadURL(storageRef);
      }

      const usersSnapshot = await getDocs(usersCollectionRef);
      const newUserId = `user${usersSnapshot.size + 1}`;

      // Agregar +52 al número de teléfono
      const telefonoConPrefijo = `52${telefono}`;

      await setDoc(doc(db, 'usuarios', newUserId), {
        expediente: Number(expediente),
        nombre: nombreUsuario,
        telefono: telefonoConPrefijo,
        contrasena: contrasena,
        foto: imageUrl,
        correo: correo,
      });

      Alert.alert('Registro exitoso', 'Por favor, verifica tu correo electrónico antes de iniciar sesión.');
      navigation.navigate('Login');
    } catch (error) {
      console.error("Error al registrar el usuario:", error);
      Alert.alert("Error", "Hubo un problema al registrar el usuario.");
    }
  };

  return (
    <View style={styles.container1}>
      <TopBar />
      <View style={styles.container}>
        <View style={styles.headerContainer}>
          <BackButton style={styles.backButton} />
          <Text style={styles.title}>Registro</Text>
        </View>
        <Text style={styles.subtitle}>Completa tu registro introduciendo{'\n'}los siguientes datos</Text>
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollViewContent}>
          <TouchableOpacity onPress={handlePickImage}>
            <View style={styles.imagePicker}>
              {image ? (
                <Image source={{ uri: image }} style={styles.image} />
              ) : (
                <Text style={styles.imagePlaceholder}>Seleccionar Imagen</Text>
              )}
            </View>
          </TouchableOpacity>

          <Text style={styles.label}>Expediente</Text>
          <TextInput
            value={expediente}
            onChangeText={text => {
              setExpediente(text);
              validateField('expediente', text);
            }}
            style={styles.input}
            keyboardType="numeric"
            maxLength={6} // Permitir solo 6 dígitos
          />
          {errors.expediente && <Text style={styles.errorText}>{errors.expediente}</Text>}

          <Text style={styles.label}>Nombre completo</Text>
          <TextInput
            value={nombreUsuario}
            onChangeText={text => {
              setNombreUsuario(text);
              validateField('nombreUsuario', text);
            }}
            style={styles.input}
          />
          {errors.nombreUsuario && <Text style={styles.errorText}>{errors.nombreUsuario}</Text>}

          <Text style={styles.label}>Correo electrónico</Text>
          <TextInput
            value={correo}
            onChangeText={text => {
              setCorreo(text);
              validateField('correo', text);
              validateEmail(text);
            }}
            style={styles.input}
          />
          {errors.correo && <Text style={styles.errorText}>{errors.correo}</Text>}

          <Text style={styles.label}>Teléfono</Text>
          <View style={styles.phoneInputContainer}>
            <Text style={styles.phonePrefix}>🇲🇽 +52</Text>
            <TextInput
              value={telefono}
              onChangeText={text => {
                setTelefono(text);
                validateField('telefono', text);
              }}
              style={styles.phoneInput}
              keyboardType="numeric"
              maxLength={10} // Permitir solo 10 dígitos
            />
          </View>
          {errors.telefono && <Text style={styles.errorText}>{errors.telefono}</Text>}

          <Text style={styles.label}>Contraseña</Text>
          <TextInput
            value={contrasena}
            onChangeText={text => {
              setContrasena(text);
              validateField('contrasena', text);
              validatePasswordLength(text, 'contrasena');
            }}
            style={styles.input}
            secureTextEntry
          />
          {errors.contrasena && <Text style={styles.errorText}>{errors.contrasena}</Text>}

          <Text style={styles.label}>Confirmar contraseña</Text>
          <TextInput
            value={confirmarContrasena}
            onChangeText={text => {
              setConfirmarContrasena(text);
              validateField('confirmarContrasena', text);
              validatePasswordLength(text, 'confirmarContrasena');
            }}
            style={styles.input}
            secureTextEntry
          />
          {errors.confirmarContrasena && <Text style={styles.errorText}>{errors.confirmarContrasena}</Text>}

          <View style={styles.buttonContainer}>
            <Button title="Registrar" onPress={handleRegistro} color="#030A8C" />
            <View style={styles.orContainer}>
              <View style={styles.line}></View>
              <Text style={styles.orText}>o inicia con</Text>
              <View style={styles.line}></View>
            </View>
          </View>

          <View style={styles.socialContainer}>
            <TouchableOpacity style={[styles.socialButton, { backgroundColor: '#0910A6' }]} onPress={() => { }}>
              <Image source={require('../assets/google.png')} style={styles.logoImage} />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.socialButton, { backgroundColor: '#4145A6' }]} onPress={() => { }}>
              <Image source={require('../assets/facebook.png')} style={styles.logoImage} />
            </TouchableOpacity>
          </View>

          <View style={styles.registerContainer}>
            <Text style={styles.registerText}>¿Tienes cuenta? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={[styles.registerText, { color: '#030A8C' }]}>Inicia sesión</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container1: {
    flex: 1,
    backgroundColor: 'white',
  },
  container: {
    flex: 1,
    backgroundColor: 'white',
    alignItems: 'center',
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 25,
    fontWeight: 'bold',
    color: '#030A8C',
    flex: 1,
    marginLeft: 10,
  },
  subtitle: {
    fontSize: 15,
    color: 'black',
    textAlign: 'center',
    marginTop: 5,
  },
  imagePicker: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#eee',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  imagePlaceholder: {
    color: '#aaa',
    textAlign: 'center',
  },
  scrollView: {
    width: '100%',
    marginVertical: 20,
  },
  scrollViewContent: {
    alignItems: 'center',
    padding: 20,
  },
  label: {
    alignSelf: 'flex-start',
    marginLeft: 20,
    marginTop: 8,
    fontSize: 15,
    color: '#000',
    marginBottom: 5,
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
  phoneInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    width: '90%',
  },
  phonePrefix: {
    fontSize: 16,
    marginRight: 5,
    color: 'black',
  },
  phoneInput: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: '#ccc',
    paddingLeft: 10,
    borderRadius: 5,
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
  errorText: {
    color: 'red',
    alignSelf: 'flex-start',
    marginLeft: 20,
    marginBottom: 5,
    fontSize: 12,
  },
});

export default RegisScreen;
