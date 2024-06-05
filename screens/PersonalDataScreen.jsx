import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, TextInput, Alert, ScrollView, KeyboardAvoidingView, Keyboard, Platform, Switch } from 'react-native';
import { getAuth } from 'firebase/auth';
import { getDocs, query, collection, where, doc, updateDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db } from '../services/firebaseConfig';
import * as ImagePicker from 'expo-image-picker';
import TopBar from '../components/TopBar';
import BottomMenuBar from '../components/BottomMenuBar';
import BackButton from '../components/BackButton';
import { agregarNotificacion } from '../services/notifications';
import ErrorAlert from '../components/ErrorAlert';

const PersonalDataScreen = ({ route, navigation }) => {
  const [user, setUser] = useState(null);
  const [isEditingPhone, setIsEditingPhone] = useState(false);
  const [newPhone, setNewPhone] = useState('');
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [newDescription, setNewDescription] = useState('');
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [error, setError] = useState('');
  const [statusCard, setStatusCard] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      const auth = getAuth();
      const currentUser = auth.currentUser;
      if (currentUser) {
        try {
          const q = query(collection(db, 'usuarios'), where('correo', '==', currentUser.email));
          const querySnapshot = await getDocs(q);
          if (!querySnapshot.empty) {
            const userDoc = querySnapshot.docs[0];
            const userData = userDoc.data();
            setUser({ ...userData, id: userDoc.id });
            setNewPhone(userData.telefono);
            setNewDescription(userData.descripcionUsuario || '');
            setStatusCard(userData.statusCard || false);
          } else {
            console.error('No se encontró el usuario con el correo:', currentUser.email);
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      }
    };

    fetchUserData();
  }, []);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => {
      setKeyboardVisible(true);
    });
    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardVisible(false);
    });

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  const updateUser = async (userId, updatedData) => {
    try {
      const userRef = doc(db, 'usuarios', userId);
      await updateDoc(userRef, updatedData);
      setUser((prevUser) => ({ ...prevUser, ...updatedData }));

      await agregarNotificacion(userRef, 'Tu información ha sido actualizada exitosamente');

      Alert.alert('Exitoso', 'La información ha sido actualizada.');
    } catch (error) {
      console.error('Error updating user data:', error);
      setError('Hubo un problema al actualizar la información.');
    }
  };

  const handleSave = () => {
    const updatedData = {};
    if (isEditingPhone) {
      if (newPhone.length !== 10) {
        setError('El número de teléfono debe tener 10 dígitos');
        return;
      }
      updatedData.telefono = newPhone;
      setIsEditingPhone(false);
    }
    if (isEditingDescription) {
      updatedData.descripcionUsuario = newDescription;
      setIsEditingDescription(false);
    }
    updatedData.statusCard = statusCard;
    if (Object.keys(updatedData).length > 0) {
      updateUser(user.id, updatedData);
    }
  };

  const handleCancel = () => {
    setNewPhone(user?.telefono);
    setIsEditingPhone(false);
    setNewDescription(user?.descripcionUsuario || '');
    setIsEditingDescription(false);
    setStatusCard(user?.statusCard || false);
  };

  const handleChangePhoto = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      const localUri = result.assets[0].uri;
      const filename = localUri.split('/').pop();
      const response = await fetch(localUri);
      const blob = await response.blob();

      const storage = getStorage();
      const storageRef = ref(storage, `profile_pictures/${filename}`);

      await uploadBytes(storageRef, blob);
      const newPhotoUrl = await getDownloadURL(storageRef);

      updateUser(user.id, { foto: newPhotoUrl });
    }
  };

  const handleStatusCardChange = async (value) => {
    if (value) {
      // Verificar si el usuario tiene una tarjeta registrada
      const tarjetasRef = collection(db, 'tarjetas');
      const q = query(tarjetasRef, where('usuarioRef', '==', doc(db, 'usuarios', user.id)));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        Alert.alert('Error', 'Debe ingresar una tarjeta antes de activar esta opción.');
        return;
      }
    }
    setStatusCard(value);
  };

  if (!user) {
    return null;
  }

  return (
    <KeyboardAvoidingView
      style={styles.safeContainer}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <TopBar />
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.contentContainer}>
          <View style={styles.headerContainer}>
            <BackButton />
            <Text style={styles.headerTitle}>Información Personal</Text>
          </View>
          <View style={styles.userInfoContainer}>
            <Image source={{ uri: user.foto }} style={styles.userPhoto} />
            <TouchableOpacity onPress={handleChangePhoto}>
              <Text style={styles.changePhotoText}>Cambiar foto de perfil</Text>
            </TouchableOpacity>
            <Text style={styles.label}>Nombre de usuario</Text>
            <Text style={[styles.userInfo, { color: '#8c8c8c' }]}>{user.nombre}</Text>

            <Text style={styles.label}>Correo</Text>
            <Text style={[styles.userInfo, { color: '#8c8c8c' }]}>{user.correo}</Text>

            <Text style={styles.label}>Expediente</Text>
            <Text style={[styles.userInfo, { color: '#8c8c8c' }]}>{user.expediente}</Text>

            <Text style={styles.label}>Teléfono</Text>
            {isEditingPhone ? (
              <TextInput
                style={styles.input}
                value={newPhone}
                onChangeText={setNewPhone}
                keyboardType="numeric"
              />
            ) : (
              <Text style={[styles.userInfo, { color: '#8c8c8c' }]}>{user.telefono}</Text>
            )}
            <TouchableOpacity style={styles.changeButton} onPress={() => setIsEditingPhone(true)}>
              <Text style={styles.changeText}>Cambiar teléfono</Text>
            </TouchableOpacity>

            <Text style={styles.label}>Descripción</Text>
            {isEditingDescription ? (
              <TextInput
                style={[styles.input, styles.descripcionInput]}
                value={newDescription}
                onChangeText={setNewDescription}
                multiline
                numberOfLines={4}
              />
            ) : (
              <Text style={[styles.userInfo, { color: '#8c8c8c' }]}>{user.descripcionUsuario}</Text>
            )}
            <TouchableOpacity style={styles.changeButton} onPress={() => setIsEditingDescription(true)}>
              <Text style={styles.changeText}>Cambiar descripción</Text>
            </TouchableOpacity>

            <View style={styles.switchContainer}>
              <Text style={styles.label}>Aceptar transferencias</Text>
              <Switch
                value={statusCard}
                onValueChange={handleStatusCardChange}
                trackColor={{ false: '#767577', true: '#030A8C' }}
                thumbColor={statusCard ? '#030A8C' : '#f4f3f4'}
              />
            </View>

            {(isEditingPhone || isEditingDescription || statusCard !== user.statusCard) && (
              <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                  <Text style={styles.saveButtonText}>Guardar cambios</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
                  <Text style={styles.cancelButtonText}>Cancelar</Text>
                </TouchableOpacity>
              </View>
            )}
            {error && (
              <ErrorAlert
                message={error}
                onClose={() => setError('')}
              />
            )}
          </View>
        </View>
      </ScrollView>
      {!keyboardVisible && <BottomMenuBar isMenuScreen={true} />}
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: 'white',
  },
  scrollContainer: {
    flexGrow: 1,
  },
  contentContainer: {
    paddingBottom: 120,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 10,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#030A8C',
    marginLeft: 10,
  },
  userInfoContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    margin: 20,
  },
  userPhoto: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
    backgroundColor: '#e1e4e8',
  },
  changePhotoText: {
    color: '#030A8C',
    marginBottom: 20,
    fontSize: 16,
  },
  label: {
    fontSize: 20,
    color: '#000',
    alignSelf: 'flex-start',
  },
  userInfo: {
    fontSize: 16,
    marginBottom: 10,
    alignSelf: 'flex-start',
    color: '#8c8c8c',
  },
  changeButton: {
    alignSelf: 'flex-end',
  },
  changeText: {
    color: '#030A8C',
  },
  input: {
    borderBottomWidth: 1,
    borderBottomColor: '#030A8C',
    marginBottom: 10,
    fontSize: 18,
    width: '100%',
    color: '#000',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  saveButton: {
    backgroundColor: '#030A8C',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  cancelButton: {
    backgroundColor: '#d9534f',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginLeft: 10,
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  descripcionInput: {
    width: '100%',
    height: 100,
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 20,
  },
});

export default PersonalDataScreen;
