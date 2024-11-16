import React, { useState } from 'react';
import { View, TextInput, StyleSheet, Text, TouchableOpacity, Image, ScrollView, Dimensions,StatusBar, Modal } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import Checkbox from 'expo-checkbox';
import { collection, getDocs, query, where, doc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { db, auth, storage } from '../services/firebaseConfig';
import BackButton from '../components/BackButton';
import ErrorAlert from '../components/ErrorAlert';
import CustomText from '../components/CustomText';


const RegisScreen = ({ navigation }) => {
  const [expediente, setExpediente] = useState('');
  const [nombreUsuario, setNombreUsuario] = useState('');
  const [telefono, setTelefono] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [confirmarContrasena, setConfirmarContrasena] = useState('');
  const [image, setImage] = useState(null);
  const [correo, setCorreo] = useState('');
  const [descripcionUsuario, setDescripcionUsuario] = useState('');
  const [error, setError] = useState('');
  const [errors, setErrors] = useState({});
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalContent, setModalContent] = useState('');


  const openModal = (content) => {
    setModalContent(content);
    setIsModalVisible(true);
  };

  const closeModal = () => {
    setIsModalVisible(false);
  };
  
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
    validateField('descripcionUsuario', descripcionUsuario);

    // Verificar si hay errores
    if (Object.keys(errors).length > 0) {
      setError('Por favor, completa todos los campos correctamente');
      return;
    }

    if (contrasena !== confirmarContrasena) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (telefono.length !== 10) {
      setError('El número de teléfono debe tener 10 dígitos');
      return;
    }

    try {
      // Verificar si el expediente ya existe en Firestore
      const usersCollectionRef = collection(db, 'usuarios');
      const expedienteQuery = query(usersCollectionRef, where('expediente', '==', Number(expediente)));
      const expedienteSnapshot = await getDocs(expedienteQuery);

      if (!expedienteSnapshot.empty) {
        setError('El expediente ya existe');
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

      const telefonoConPrefijo = `52${telefono}`;

      await setDoc(doc(db, 'usuarios', newUserId), {
        expediente: Number(expediente),
        nombre: nombreUsuario,
        telefono: telefonoConPrefijo,
        contrasena: contrasena,
        foto: imageUrl,
        correo: correo,
        descripcionUsuario: descripcionUsuario,
        statusCard: false,
        registroFecha: new Date(),
      });

      // setError('Registro exitoso. Por favor, verifica tu correo electrónico antes de iniciar sesión.');
      navigation.navigate('Success');
    } catch (error) {
      console.error("Error al registrar el usuario:", error);
      setError("Hubo un problema al registrar el usuario.");
    }
  };

  //! VISUAL ELEMENTS

  return (
    <View style={styles.container1}>
        <StatusBar
        barStyle="dark-content"
        backgroundColor="#FFFFFF"
        translucent={false}
      />
      <View style={styles.container}>
        <View style={styles.headerContainer}>
        <BackButton />
          <CustomText style={styles.title} fontWeight='Bold'>Registro</CustomText>
        </View>
        <CustomText style={styles.subtitle} fontWeight='Medium'>Completa tu registro introduciendo los siguientes datos: </CustomText>
        {error && (
          <ErrorAlert
            message={error}
            onClose={() => setError('')}
          />
        )}
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollViewContent}>
          <TouchableOpacity onPress={handlePickImage}>
            <View style={styles.imagePicker}>
              {image ? (
                <Image source={{ uri: image }} style={styles.image} />
              ) : (
                <CustomText style={styles.imagePlaceholder} fontWeight='Medium'>Seleccionar Imagen</CustomText>
              )}
            </View>
          </TouchableOpacity>

          <CustomText style={styles.label}>Expediente</CustomText>
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

          <CustomText style={styles.label}>Nombre completo</CustomText>
          <TextInput
            value={nombreUsuario}
            onChangeText={text => {
              setNombreUsuario(text);
              validateField('nombreUsuario', text);
            }}
            style={styles.input}
          />
          {errors.nombreUsuario && <Text style={styles.errorText}>{errors.nombreUsuario}</Text>}

          <CustomText style={styles.label}>Correo electrónico</CustomText>
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

          <CustomText style={styles.label}>Teléfono</CustomText>
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

          <CustomText style={styles.label}>Contraseña</CustomText>
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

          <CustomText style={styles.label}>Confirmar contraseña</CustomText>
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

          <CustomText style={styles.label}>Descripción</CustomText>
          <TextInput
            value={descripcionUsuario}
            onChangeText={text => {
              setDescripcionUsuario(text);
              validateField('descripcionUsuario', text);
            }}
            style={[styles.input, styles.descripcionInput]} // Añadir un estilo adicional
            multiline
            numberOfLines={4}
            maxLength={150} 
          />
          {errors.descripcionUsuario && <Text style={styles.errorText}>{errors.descripcionUsuario}</Text>}


          {/*Checkbox de terminos y politicas*/}
          <View style={styles.checkboxContainer}>
            <Checkbox
              value={acceptedTerms}
              onValueChange={setAcceptedTerms}
              color={acceptedTerms ? '#FF6347' : undefined}
              style={styles.checkbox}
            />
            <CustomText style={styles.termsText} fontWeight="Medium">
              Acepto los{' '}
              <CustomText style={styles.linkText} fontWeight="Medium" onPress={() => openModal('Términos y Condiciones')}>
                Términos y Condiciones
              </CustomText>{' '}
              y{' '}
              <CustomText style={styles.linkText} fontWeight="Medium" onPress={() => openModal('Políticas de Privacidad')}>
                Políticas de Privacidad
              </CustomText>.
            </CustomText>
          </View>
          

          {/*Cambio de boton conforme al check box*/}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.signupButton, !acceptedTerms && { backgroundColor: 'gray' }]}
              onPress={handleRegistro}
              disabled={!acceptedTerms}
            >
            <CustomText  style={styles.signupButtonlabel}>Registrar</CustomText>
            </TouchableOpacity>

            {/*Documentacion de los terminos y condiciones*/}
            <Modal
              visible={isModalVisible}
              transparent={true}
              animationType="slide"
              onRequestClose={closeModal}
            >
              <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                  <ScrollView 
                    contentContainerStyle={styles.modalScrollContent} 
                    showsVerticalScrollIndicator={false}
                  >
                    <Text style={styles.modalTitle}>{modalContent}</Text>

                    {modalContent === 'Términos y Condiciones' ? (
                      <Text style={styles.modalText}>
                        <Text style={styles.sectionTitle}>Última actualización: 28 de octubre de 2024</Text>{'\n\n'}
                        Bienvenido a nuestra aplicación. Al utilizar esta plataforma, aceptas los{' '}
                        <Text style={styles.bold}>Términos y Condiciones</Text>. Te recomendamos leerlos detenidamente.{'\n\n'}

                        <Text style={styles.subheading}>1. Aceptación de los Términos</Text>{'\n'}
                        El acceso y uso de la aplicación implica la aceptación de estos términos.{'\n\n'}

                        <Text style={styles.subheading}>2. Registro y Uso de la Cuenta</Text>{'\n'}
                        - Debes proporcionar información veraz al registrarte.{'\n'}
                        - Eres responsable de la confidencialidad de tu contraseña.{'\n'}
                        - Podemos eliminar cuentas por incumplimiento de los términos.{'\n\n'}

                        <Text style={styles.subheading}>3. Uso Aceptable</Text>{'\n'}
                        Está prohibido publicar contenido ofensivo o fraudulento.{'\n\n'}

                        <Text style={styles.subheading}>4. Modificaciones</Text>{'\n'}
                        Nos reservamos el derecho de modificar estos términos.{'\n\n'}

                        <Text style={styles.subheading}>5. Limitación de Responsabilidad</Text>{'\n'}
                        No somos responsables por interrupciones del servicio.{'\n\n'}
                      </Text>
                    ) : (
                      <Text style={styles.modalText}>
                        <Text style={styles.sectionTitle}>Última actualización: 28 de octubre de 2024</Text>{'\n\n'}
                        Nos tomamos en serio tu privacidad. Esta política describe cómo{' '}
                        <Text style={styles.bold}>recopilamos, usamos y protegemos</Text> tu información.{'\n\n'}

                        <Text style={styles.subheading}>1. Información que Recopilamos</Text>{'\n'}
                        - Datos personales proporcionados durante el registro.{'\n'}
                        - Información técnica del dispositivo.{'\n\n'}

                        <Text style={styles.subheading}>2. Uso de la Información</Text>{'\n'}
                        Utilizamos tus datos para mejorar la experiencia.{'\n\n'}

                        <Text style={styles.subheading}>3. Compartir Información con Terceros</Text>{'\n'}
                        No compartimos datos sin tu consentimiento, excepto por ley.{'\n\n'}

                        <Text style={styles.subheading}>4. Seguridad</Text>{'\n'}
                        Implementamos medidas para proteger tu información.{'\n\n'}

                        <Text style={styles.subheading}>5. Modificaciones</Text>{'\n'}
                        Podemos modificar esta política en cualquier momento.{'\n\n'}
                      </Text>
                    )}

                    <TouchableOpacity onPress={closeModal} style={styles.closeButton}>
                      <Text style={styles.closeButtonText}>Cerrar</Text>
                    </TouchableOpacity>
                  </ScrollView>
                </View>
              </View>
            </Modal>

          
            <View style={styles.orContainer}>
              <View style={styles.line}></View>
              <CustomText style={styles.orText}>o inicia con</CustomText>
              <View style={styles.line}></View>
            </View>
          </View>

          <View style={styles.socialContainer}>
            <TouchableOpacity style={[styles.socialButton, { backgroundColor: '#C62A0E' }]} onPress={() => { }}>
              <Image source={require('../assets/google.png')} style={styles.logoImage} />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.socialButton, { backgroundColor: '#ED3615' }]} onPress={() => { }}>
              <Image source={require('../assets/facebook.png')} style={styles.logoImage} />
            </TouchableOpacity>
          </View>

          <View style={styles.registerContainer}>
            <CustomText style={styles.registerText}>¿Tienes cuenta? </CustomText>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <CustomText style={[styles.registerText, { color: '#FF6347' }]}>Inicia sesión</CustomText>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </View>
  );
};

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container1: {
    flex: 1,
    backgroundColor: 'white',
  },
  container: {
    flex: 1,
    backgroundColor: 'white',
    alignItems: 'center',
    paddingTop: '20'
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 34, // Mantener fontSize sin cambios
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
    flex: 1, // Hace que el texto ocupe el espacio restante
  },
  subtitle: {
    fontSize: 16, // Mantener fontSize sin cambios
    color: 'black',
    textAlign: 'left',
    marginTop: height * 0.01, // Ajuste dinámico de márgenes
    width: '90%',
  },
  imagePicker: {
    width: width * 0.3, // Ajuste responsivo
    height: width * 0.3,
    borderRadius: 10, // Mantener borderRadius sin cambios
    backgroundColor: '#eee',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: height * 0.02, // Ajuste dinámico de márgenes
  },
  image: {
    width: width * 0.3, // Ajuste responsivo
    height: width * 0.3,
    borderRadius: 10, // Mantener borderRadius sin cambios
  },
  imagePlaceholder: {
    color: '#aaa',
    textAlign: 'center',
  },
  scrollView: {
    width: '100%',
    marginVertical: height * 0.02, // Ajuste dinámico de márgenes
  },
  scrollViewContent: {
    alignItems: 'center',
    padding: width * 0.05, // Ajuste dinámico de padding
  },
  label: {
    alignSelf: 'flex-start',
    marginLeft: width * 0.05, // Ajuste dinámico de márgenes
    marginTop: height * 0.01, // Ajuste dinámico de márgenes
    fontSize: 14, // Mantener fontSize sin cambios
    color: '#000',
    marginBottom: height * 0.01, // Ajuste dinámico de márgenes
  },
  input: {
    height: height * 0.05, // Ajuste dinámico de altura
    marginTop: height * 0.01, // Ajuste dinámico de márgenes
    marginBottom: height * 0.015, // Ajuste dinámico de márgenes
    borderWidth: 1,
    borderColor: '#ccc',
    paddingLeft: 10,
    borderRadius: 5, // Mantener borderRadius sin cambios
    width: '90%',
  },
  phoneInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: height * 0.015, // Ajuste dinámico de márgenes
    width: '90%',
  },
  phonePrefix: {
    fontSize: 16, // Mantener fontSize sin cambios
    marginRight: width * 0.02, // Ajuste dinámico de márgenes
    color: 'black',
  },
  phoneInput: {
    flex: 1,
    height: height * 0.05, // Ajuste dinámico de altura
    borderWidth: 1,
    borderColor: '#ccc',
    paddingLeft: 10,
    borderRadius: 5, // Mantener borderRadius sin cambios
  },
  buttonContainer: {
    width: '90%',
    marginTop: height * 0.02, // Ajuste dinámico de márgenes
  },
  signupButton: {
    marginTop: height * 0.015, // Ajuste dinámico de márgenes
    marginBottom: height * 0.02, // Ajuste dinámico de márgenes
    backgroundColor: '#FF6347',
    padding: height * 0.015, // Ajuste dinámico de padding
    borderRadius: 10, // Mantener borderRadius sin cambios
    width: '100%',
    alignSelf: 'center',
  },
  signupButtonlabel: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 14,
  },
  orContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: height * 0.015, // Ajuste dinámico de márgenes
  },
  line: {
    borderBottomWidth: 1,
    borderBottomColor: 'gray',
    flex: 1,
  },
  orText: {
    marginHorizontal: width * 0.03, // Ajuste dinámico de márgenes
    color: 'gray',
  },
  socialContainer: {
    flexDirection: 'row',
    marginTop: height * 0.02, // Ajuste dinámico de márgenes
    justifyContent: 'center',
    alignItems: 'center',
  },
  socialButton: {
    width: width * 0.15, // Ajuste dinámico del tamaño
    height: width * 0.15, // Mantener la forma circular
    borderRadius: width * 0.075, // Ajuste dinámico para mantener la forma circular
    backgroundColor: '#DDDDDD',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: width * 0.03, // Ajuste dinámico de márgenes
  },
  logoImage: {
    width: width * 0.05, // Ajuste dinámico del tamaño
    height: width * 0.05,
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: height * 0.02, // Ajuste dinámico de márgenes
  },
  registerText: {
    color: 'black',
    fontSize: 14, // Mantener fontSize sin cambios
  },
  errorText: {
    color: 'red',
    alignSelf: 'flex-start',
    marginLeft: width * 0.05, // Ajuste dinámico de márgenes
    marginBottom: height * 0.01, // Ajuste dinámico de márgenes
    fontSize: 12, // Mantener fontSize sin cambios
  },
  descripcionInput: {
    width: '90%', 
    height: height * 0.1, // Ajuste dinámico de la altura
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 19,

  },
  checkbox: {
    width: 22,
    height: 22,
    marginRight: 10,
    borderColor: '#FF6347', // Contorno en color naranja
    borderWidth: 2, // Asegura que el borde sea visible
    borderRadius: 3, // Opcional para esquinas redondeadas
  },
  termsText: {
    fontSize: 14,
    color: '#575757',
    flex: 1,
  },
  linkText: {
    color: '#FF6347',
    textDecorationLine: 'underline',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '90%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    maxHeight: '80%',
  },
  modalScrollContent: {
    paddingHorizontal: 10, // Añadir espacio a los lados
    paddingBottom: 10, // Espacio al final
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  subheading: {
    fontSize: 14,
    fontWeight: '600',
    marginVertical: 5,
  },
  modalText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 22,
    textAlign: 'justify',
  },
  bold: {
    fontWeight: 'bold',
  },
  closeButton: {
    backgroundColor: '#FF6347',
    borderRadius: 5,
    padding: 10,
    alignItems: 'center',
  },
  closeButtonText: {
    color: 'white',
    fontSize: 13,
    fontWeight: 'bold',
  },
});

export default RegisScreen;
