import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet, Text, TouchableOpacity, Image, ScrollView } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { collection, addDoc, getDocs, doc, setDoc } from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { db, auth } from '../services/firebaseConfig'; // Asegúrate de tener configurado tu archivo de configuración de Firebase
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

  const handleRegistro = async () => {
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

    try {
      // Crear el usuario en Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, correo, contrasena);
      const user = userCredential.user;

      // Obtener la colección de usuarios
      const usersCollectionRef = collection(db, 'usuarios');
      const usersSnapshot = await getDocs(usersCollectionRef);

      // Generar un nuevo ID secuencial
      const newUserId = `user${usersSnapshot.size + 1}`;

      // Registrar el usuario en Firestore con el ID generado
      await setDoc(doc(db, 'usuarios', newUserId), {
        expediente: Number(expediente),
        nombre: nombreUsuario,
        telefono: telefono,
        contrasena: contrasena,
        foto: image,
        correo: correo,
      });

      // Navegar a la pantalla de Verificar
      navigation.navigate('Verify', { telefono: telefono });
    } catch (error) {
      console.error("Error al registrar el usuario:", error);
      alert("Error al registrar el usuario: " + error.message);
    }
  };

  return (
    <View style={styles.container1}>
      <TopBar />
      <View style={styles.container}>
        <View style={styles.headerContainer}>
          <BackButton style={styles.backButton}/>
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
            onChangeText={setExpediente}
            style={styles.input}
            keyboardType="numeric"
          />

          <Text style={styles.label}>Nombre completo</Text>
          <TextInput 
            value={nombreUsuario}
            onChangeText={setNombreUsuario}
            style={styles.input}
          />

          <Text style={styles.label}>Correo electrónico</Text>
          <TextInput 
            value={correo}
            onChangeText={setCorreo}
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

export default RegisScreen;