import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Keyboard,
  Platform,
  Switch,
} from 'react-native';
import { getAuth } from 'firebase/auth';
import { getDocs, query, collection, where, doc, updateDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db } from '../services/firebaseConfig';
import * as ImagePicker from 'expo-image-picker';
import TopBar from '../components/TopBar';
import { agregarNotificacion } from '../services/notifications';
import ErrorAlert from '../components/ErrorAlert';

const PersonalDataScreen = ({ navigation }) => {
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState({ phone: false, description: false });
  const [formData, setFormData] = useState({ phone: '', description: '', statusCard: false });
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUserData = async () => {
      const currentUser = getAuth().currentUser;
      if (!currentUser) return;
      try {
        const q = query(collection(db, 'usuarios'), where('correo', '==', currentUser.email));
        const userSnapshot = await getDocs(q);
        if (!userSnapshot.empty) {
          const userDoc = userSnapshot.docs[0];
          const userData = userDoc.data();
          setUser({ ...userData, id: userDoc.id });
          setFormData({
            phone: userData.telefono,
            description: userData.descripcionUsuario || '',
            statusCard: userData.statusCard || false,
          });
        }
      } catch (err) {
        console.error('Error fetching user data:', err);
      }
    };
    fetchUserData();
  }, []);

  const handleSave = useCallback(async () => {
    const updatedData = {
      telefono: formData.phone,
      descripcionUsuario: formData.description,
      statusCard: formData.statusCard,
    };

    if (isEditing.phone && formData.phone.length !== 10) {
      return setError('El número de teléfono debe tener 10 dígitos');
    }

    try {
      const userRef = doc(db, 'usuarios', user.id);
      await updateDoc(userRef, updatedData);
      setUser((prevUser) => ({ ...prevUser, ...updatedData }));
      await agregarNotificacion(userRef, 'Tu información ha sido actualizada exitosamente');
      Alert.alert('Exitoso', 'La información ha sido actualizada.');
      setIsEditing({ phone: false, description: false });
    } catch (err) {
      console.error('Error updating user data:', err);
      setError('Hubo un problema al actualizar la información.');
    }
  }, [formData, isEditing]);

  const handleChangePhoto = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (result.canceled) return;

    try {
      const localUri = result.assets[0].uri;
      const filename = localUri.split('/').pop();
      const blob = await (await fetch(localUri)).blob();
      const storageRef = ref(getStorage(), `profile_pictures/${filename}`);
      await uploadBytes(storageRef, blob);
      const newPhotoUrl = await getDownloadURL(storageRef);
      await updateDoc(doc(db, 'usuarios', user.id), { foto: newPhotoUrl });
      setUser((prev) => ({ ...prev, foto: newPhotoUrl }));
    } catch (err) {
      console.error('Error uploading photo:', err);
      setError('No se pudo cambiar la foto.');
    }
  };

  const handleStatusCardChange = (value) => setFormData((prev) => ({ ...prev, statusCard: value }));

  if (!user) return null;

  return (
    <KeyboardAvoidingView style={styles.safeContainer} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <TopBar title="Información personal" showBackButton={true} />
      <View style={styles.userInfoContainer}>
        <UserInfoSection
          user={user}
          formData={formData}
          setFormData={setFormData}
          isEditing={isEditing}
          setIsEditing={setIsEditing}
          handleChangePhoto={handleChangePhoto}
          handleStatusCardChange={handleStatusCardChange}
          handleSave={handleSave}
        />
        {error && <ErrorAlert message={error} onClose={() => setError('')} />}
      </View>
    </KeyboardAvoidingView>
  );
};

const UserInfoSection = ({
  user,
  formData,
  setFormData,
  isEditing,
  setIsEditing,
  handleChangePhoto,
  handleStatusCardChange,
  handleSave,
}) => (
  <View style={styles.userDetailsContainer}>
    <Image source={{ uri: user.foto }} style={styles.userPhoto} />
    <TouchableOpacity onPress={handleChangePhoto}>
      <Text style={styles.changePhotoText}>Cambiar imagen</Text>
    </TouchableOpacity>
    <View style={styles.detailsContent}>
      <Text style={styles.username}>{user.nombre}</Text>
      <Text style={styles.label}>Correo</Text>
      <Text style={styles.userInfo}>{user.correo}</Text>
      <Text style={styles.label}>Expediente</Text>
      <Text style={styles.userInfo}>{user.expediente}</Text>
      <Text style={styles.label}>Teléfono</Text>
      <TextInput
        style={styles.inputBox}
        value={formData.phone}
        onChangeText={(text) => setFormData((prev) => ({ ...prev, phone: text }))}
        placeholder="Ingresa tu número de teléfono"
        placeholderTextColor="#DBD4D3"
      />
      <Text style={styles.label}>Descripción</Text>
      <TextInput
        style={styles.inputBox}
        value={formData.description}
        onChangeText={(text) => setFormData((prev) => ({ ...prev, description: text }))}
        placeholder="Ingresa tu descripción"
        placeholderTextColor="#DBD4D3"
        multiline
      />
      <View style={styles.switchContainer}>
        <Text style={styles.label}>Aceptar transferencias</Text>
        <Switch
          value={formData.statusCard}
          onValueChange={handleStatusCardChange}
          trackColor={{ false: '#767577', true: '#030A8C' }}
          thumbColor={formData.statusCard ? '#030A8C' : '#f4f3f4'}
        />
      </View>
      <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
        <Text style={styles.saveButtonText}>Guardar cambios</Text>
      </TouchableOpacity>
    </View>
  </View>
);

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: '#FF6347',
  },
  userInfoContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  userDetailsContainer: {
    width: '100%',
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingTop: 80,
    paddingTop: 20,
    paddingBottom: 40,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    alignItems: 'center',
    position: 'relative',

  },
  userPhoto: {
    width: 120,
    height: 120,
    borderRadius: 10,
    marginBottom: 10,
    backgroundColor: '#e1e4e8',
    position: 'absolute',
    top: -60,
    alignSelf: 'center',
  },
  changePhotoText: {
    marginTop: 70,
    color: '#FF6347',
    fontSize: 18,
    marginBottom: 20,
  },
  username: {
    fontWeight: 'bold',
    fontSize: 20,
    marginBottom: 10,
    borderBottomWidth: 1,
    borderColor: '#DBD4D3',
    paddingBottom: 10,
  },
  inputBox: {
    borderWidth: 1,
    borderColor: '#DBD4D3',
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    fontSize: 18,
    width: '100%',
    color: '#DBD4D6',
  },
  saveButton: {
    backgroundColor: '#FF6347',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
    width: '90%',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 18,
  },
  label: {
    fontSize: 18,
    fontWeight: 'semibold',
  },
  userInfo: {
    fontSize: 16,
    color: '#C6C6C6',
    marginBottom: 10,
  },
  detailsContent: {
    width: '90%',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
});

export default PersonalDataScreen;
