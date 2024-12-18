import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Image, ScrollView, KeyboardAvoidingView, Platform, Keyboard } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Picker } from '@react-native-picker/picker';
import { collection, getDocs, query, where, doc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage, auth } from '../services/firebaseConfig';
import TopBar from '../components/TopBar';
import BottomMenuBar from '../components/BottomMenuBar';
import BackButton from '../components/BackButton';
import { onAuthStateChanged } from 'firebase/auth';
import { agregarNotificacion } from '../services/notifications'; // Importar la función
import ErrorAlert from '../components/ErrorAlert'; // Importar el componente
import CustomText from '../components/CustomText';
import Header from '../components/Header';

const AddProductsScreen = ({ navigation }) => {
  const [productName, setProductName] = useState('');
  const [productPrice, setProductPrice] = useState('');
  const [productUnits, setProductUnits] = useState('');
  const [productCategory, setProductCategory] = useState('');
  const [productDescription, setProductDescription] = useState('');
  const [productImage, setProductImage] = useState(null);
  const [userDocId, setUserDocId] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserEmail(user.email);
        fetchUserDocId(user.email);
      } else {
      }
    });

    return () => unsubscribe();
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

  const fetchUserDocId = async (email) => {
    const q = query(collection(db, 'usuarios'), where('correo', '==', email));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      const userDoc = querySnapshot.docs[0];
      setUserDocId(userDoc.id);
    } else {
      console.error('No se encontró el usuario');
    }
  };

  const handleChooseImage = async () => {
    let permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted === false) {
      setError('Permission to access camera roll is required!');
      return;
    }

    let pickerResult = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: false,
    });
    if (pickerResult.canceled) {
      return;
    }

    if (pickerResult.assets.length > 0 && pickerResult.assets[0].uri) {
      setProductImage(pickerResult.assets[0].uri);
    }
  };

  const handlePublishProduct = async () => {
    if (productName && productPrice && productUnits && productImage && productCategory && productDescription) {
      try {
        // Subir la imagen a Firebase Storage
        const response = await fetch(productImage);
        const blob = await response.blob();
        const storageRef = ref(storage, `productos/${Date.now()}-${productName}`);
        await uploadBytes(storageRef, blob);

        // Obtener la URL de descarga de la imagen
        const imageUrl = await getDownloadURL(storageRef);

        // Obtener la colección de productos
        const productsCollectionRef = collection(db, 'productos');
        const productsSnapshot = await getDocs(productsCollectionRef);

        // Generar un nuevo ID secuencial para el producto
        const newProductId = `producto${productsSnapshot.size + 1}`;

        // Crear referencias a los documentos del usuario
        const userDocRef = doc(db, 'usuarios', userDocId);

        const newProduct = {
          nombre: productName,
          precio: Number(productPrice),
          cantidad: Number(productUnits),
          descripcion: productDescription,
          imagen: imageUrl,
          categoria: productCategory,
          fotoVendedorRef: userDocRef,
          vendedorRef: userDocRef,
          statusView: true,
        };

        // Agregar el nuevo producto a Firestore
        await setDoc(doc(db, 'productos', newProductId), newProduct);

        // Agregar notificación para el usuario
        await agregarNotificacion(userDocRef, 'Has publicado un producto con éxito');

        // Navegar a la pantalla de productos cargados
        navigation.navigate('LoadProduct');
      } catch (error) {
        console.error("Error al agregar el producto:", error);
        setError("Hubo un problema al agregar el producto.");
      }
    } else {
      setError('Por favor completa todos los campos');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <TopBar />

      {error && (
        <ErrorAlert
          message={error}
          onClose={() => setError('')}
        />
      )}
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Header title="Publicar producto" />
        <View style={styles.formContainer}>
          <CustomText style={styles.label} fontWeight='Medium'>Nombre del Producto</CustomText>
          <TextInput
            style={styles.input}
            value={productName}
            onChangeText={setProductName}
          />
          <CustomText style={styles.label} fontWeight='Medium'>Categoría del Producto</CustomText>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={productCategory}
              style={styles.picker}
              onValueChange={(itemValue) => {
                if (itemValue !== "") {
                  setProductCategory(itemValue);
                }
              }}
            >
              <Picker.Item label="Selecciona una categoría" value="" enabled={false} />
              <Picker.Item label="Frituras" value="Frituras" />
              <Picker.Item label="Dulces" value="Dulces" />
              <Picker.Item label="Comida" value="Comida" />
              <Picker.Item label="Bebidas" value="Bebidas" />
              <Picker.Item label="Postres" value="Postres" />
              <Picker.Item label="Dispositivos" value="Dispositivos" />
              <Picker.Item label="Otros" value="Otros" />
            </Picker>
          </View>
          <View style={styles.row}>
            <View style={styles.columnSmall}>
              <CustomText style={styles.label} fontWeight='Medium'>Precio</CustomText>
              <View style={styles.inputContainer}>
                <CustomText style={styles.prefix} fontWeight='SemiBold'>$ </CustomText>
                <TextInput
                  style={[styles.input, styles.inputWithoutBorder]}
                  value={productPrice}
                  onChangeText={setProductPrice}
                  keyboardType="numeric"
                />
              </View>
            </View>
            <View style={styles.columnLarge}>
              <CustomText style={styles.label} fontWeight='Medium'>Unidades</CustomText>
              <View style={styles.inputContainer}>
                <TextInput
                  style={[styles.input, styles.inputWithoutBorder]}
                  value={productUnits}
                  onChangeText={setProductUnits}
                  keyboardType="numeric"
                />
                <CustomText style={styles.suffix} fontWeight='SemiBold'> piezas</CustomText>
              </View>
            </View>
          </View>
          <CustomText style={styles.label} fontWeight='Medium'>Descripción</CustomText>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={productDescription}
            onChangeText={setProductDescription}
            multiline
          />
          <CustomText style={styles.labelImage} fontWeight='Medium'>Imagen del Producto</CustomText>
          <TouchableOpacity style={styles.imagePicker} onPress={handleChooseImage}>
            {productImage ? (
              <Image source={{ uri: productImage }} style={styles.imagePreview} />
            ) : (
              <>
                <Image source={require('../assets/photoImage.png')} style={styles.imagePlaceholder} />
              </>
            )}
          </TouchableOpacity>
          <TouchableOpacity style={styles.publishButton} onPress={handlePublishProduct}>
            <CustomText style={styles.publishButtonText} fontWeight='Bold'>Publicar producto</CustomText>
          </TouchableOpacity>
        </View>
      </ScrollView>
      {!keyboardVisible && <BottomMenuBar />}
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 100,
    marginLeft: 10,
    marginRight: 10,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 15,
    marginBottom: 15,

  },
  title: {
    fontSize: 24,
    color: '#000',
    textAlign: 'center',
    flex: 1,
  },
  formContainer: {
    paddingLeft: 20,
    paddingRight: 20,
  },
  label: {
    fontSize: 14,
    color: '#000',
    marginBottom: 10,
    marginTop: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 10,
    fontSize: 16,
  },
  inputWithoutBorder: {
    borderWidth: 0,
    flex: 1,
    paddingVertical: 10,
    fontSize: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#DFDFDF',
    borderRadius: 6,
    paddingHorizontal: 10,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    marginBottom: 10,
  },
  picker: {
    height: 50,
    width: '100%',
  },
  prefix: {
    fontSize: 14,
    color: '#000',
  },
  suffix: {
    fontSize: 14,
    color: '#000',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  columnSmall: {
    flex: 1,
    marginRight: 5,
  },
  columnLarge: {
    flex: 2,
    marginLeft: 20,
  },
  imagePicker: {
    height: 180,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    marginTop: 10,
    position: 'relative',
  },
  imagePickerText: {
    color: '#ccc',
    fontSize: 16,
  },
  imagePreview: {
    width: '100%',
    height: '100%',
    borderRadius: 6,
  },
  imagePlaceholder: {
    position: 'absolute',
    width: 45,
    height: 45,
  },
  labelImage: {
    fontSize: 14,
    color: '#000',
    marginBottom: 4,
    marginTop: 20,
  },
  publishButton: {
    backgroundColor: '#FF6347',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
    marginTop: 20,
    alignItems: 'center',
    width: '100%',
  },
  publishButtonText: {
    color: 'white',
    fontSize: 13,
  },
});

export default AddProductsScreen;
