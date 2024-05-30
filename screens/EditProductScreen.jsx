import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, StyleSheet, Image, TouchableOpacity, ScrollView, Alert, KeyboardAvoidingView, Platform, Keyboard } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { getAuth } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import * as ImagePicker from 'expo-image-picker';
import { db } from '../services/firebaseConfig';
import TopBar from '../components/TopBar';
import BottomMenuBar from '../components/BottomMenuBar';
import BackButton from '../components/BackButton';

const EditProductScreen = ({ route, navigation }) => {
  const { productId } = route.params;
  const [product, setProduct] = useState(null);
  const [nombre, setNombre] = useState('');
  const [precio, setPrecio] = useState('');
  const [cantidad, setCantidad] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [categoria, setCategoria] = useState('');
  const [imagen, setImagen] = useState('');
  const [uploading, setUploading] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    const fetchProductData = async () => {
      try {
        const productDoc = await getDoc(doc(db, 'productos', productId));
        if (productDoc.exists()) {
          const productData = productDoc.data();
          setProduct(productData);
          setNombre(productData.nombre);
          setPrecio(productData.precio.toString());
          setCantidad(productData.cantidad.toString());
          setDescripcion(productData.descripcion);
          setCategoria(productData.categoria);
          setImagen(productData.imagen);
        }
      } catch (error) {
        console.error('Error fetching product data:', error);
      }
    };

    fetchProductData();
  }, [productId]);

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

  const handleSave = async () => {
    try {
      await updateDoc(doc(db, 'productos', productId), {
        nombre,
        precio: parseFloat(precio),
        cantidad: parseInt(cantidad, 10),
        descripcion,
        categoria,
        imagen,
      });
      Alert.alert('Éxito', 'Producto modificado exitosamente.');
      navigation.goBack();
    } catch (error) {
      console.error('Error al actualizar el producto:', error);
    }
  };

  const handleDelete = async () => {
    try {
      await updateDoc(doc(db, 'productos', productId), {
        statusView: false,
      });
      Alert.alert('Éxito', 'Producto eliminado exitosamente.');
      navigation.goBack();
    } catch (error) {
      console.error('Error al eliminar el producto:', error);
    }
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 1,
    });

    if (!result.canceled) {
      const localUri = result.assets[0].uri;
      const filename = localUri.split('/').pop();
      const response = await fetch(localUri);
      const blob = await response.blob();

      const storage = getStorage();
      const storageRef = ref(storage, `product_images/${filename}`);

      setUploading(true);
      try {
        await uploadBytes(storageRef, blob);
        const downloadURL = await getDownloadURL(storageRef);
        setImagen(downloadURL);
        setUploading(false);
      } catch (error) {
        console.error('Error al subir la imagen:', error);
        setUploading(false);
      }
    }
  };

  const handleDescriptionChange = (text) => {
    const words = text.split(' ');
    if (words.length <= 100) {
      setDescripcion(text);
    }
  };

  if (!product) {
    return (
      <View style={styles.container}>
        <TopBar />
        <Text style={styles.loadingText}>Cargando producto...</Text>
        <BottomMenuBar isMenuScreen={true} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <TopBar />
      <View style={styles.headerContainer}>
        <BackButton />
        <Text style={styles.title}>Editar producto</Text>
      </View>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.formContainer}>
          <Text style={styles.label}>Nombre del producto</Text>
          <TextInput
            style={styles.input}
            value={nombre}
            onChangeText={setNombre}
          />

          <Text style={styles.label}>Categoría</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={categoria}
              onValueChange={(itemValue) => setCategoria(itemValue)}
            >
              <Picker.Item label="Frituras" value="Frituras" />
              <Picker.Item label="Bebidas" value="Bebidas" />
              <Picker.Item label="Comida" value="Comida" />
              <Picker.Item label="Dispositivos" value="Dispositivos" />
              <Picker.Item label="Dulces" value="Dulces" />
              <Picker.Item label="Postres" value="Postres" />
              <Picker.Item label="Otros" value="Otros" />
            </Picker>
          </View>

          <View style={styles.priceQuantityContainer}>
            <View style={styles.inputContainerSmall}>
              <Text style={styles.label}>Precio</Text>
              <View style={styles.inputWithPrefix}>
                <Text style={styles.prefix}>$</Text>
                <TextInput
                  style={styles.inputWithoutBorder}
                  value={precio}
                  onChangeText={setPrecio}
                  keyboardType="numeric"
                />
              </View>
            </View>
            <View style={styles.inputContainerLarge}>
              <Text style={styles.label}>Número de unidades</Text>
              <View style={styles.inputWithSuffix}>
                <TextInput
                  style={styles.inputWithoutBorder}
                  value={cantidad}
                  onChangeText={setCantidad}
                  keyboardType="numeric"
                />
                <Text style={styles.suffix}>piezas</Text>
              </View>
            </View>
          </View>

          <Text style={styles.label}>Descripción</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={descripcion}
            onChangeText={handleDescriptionChange}
            multiline
          />

          <Text style={styles.label}>Imagen del producto</Text>
          <View style={styles.imageContainer}>
            {imagen ? (
              <Image source={{ uri: imagen }} style={styles.productImage} />
            ) : (
              <Text style={styles.noImageText}>No hay imagen</Text>
            )}
            <TouchableOpacity style={styles.editIcon} onPress={pickImage}>
              <Image source={require('../assets/iconEdit.png')} style={styles.iconImage} />
            </TouchableOpacity>
            {uploading && <Text style={styles.uploadingText}>Subiendo imagen...</Text>}
          </View>
        </View>
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
            <Text style={styles.deleteButtonText}>Eliminar Producto</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>Guardar Cambios</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      {!keyboardVisible && <BottomMenuBar isMenuScreen={true} />}
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  scrollContainer: {
    paddingBottom: 80,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#030A8C',
    marginLeft: 10,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 10,
  },
  formContainer: {
    padding: 30,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    marginBottom: 20,
    marginTop: 5,
  },
  label: {
    fontSize: 17,
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 12,
    fontSize: 16,
    marginTop: 5,
    marginBottom: 20,
  },
  inputWithoutBorder: {
    flex: 1,
    fontSize: 16,
    marginHorizontal: 10,
  },
  inputWithPrefix: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
  },
  prefix: {
    marginRight: 5,
    fontSize: 16,
  },
  inputWithSuffix: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
  },
  suffix: {
    marginLeft: 5,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
    marginBottom: 20,
  },
  priceQuantityContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  inputContainerSmall: {
    flex: 1,
    marginRight: 10,
  },
  inputContainerLarge: {
    flex: 2,
  },
  imageContainer: {
    alignItems: 'center',
    position: 'relative',
    borderColor: '#ccc',
    borderWidth: 1,
    padding: 25,
  },
  productImage: {
    width: 100,
    height: 100,
    borderRadius: 10,
    marginBottom: 10,
  },
  noImageText: {
    fontSize: 16,
    color: '#ccc',
  },
  editIcon: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  iconImage: {
    width: 20,
    height: 20,
  },
  uploadingText: {
    marginTop: 10,
    color: '#666',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  deleteButton: {
    backgroundColor: 'red',
    padding: 15,
    borderRadius: 5,
    marginLeft: 35,
  },
  deleteButtonText: {
    color: 'white',
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: '#030A8C',
    padding: 15,
    borderRadius: 5,
    marginRight: 35,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
  },
  loadingText: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    marginVertical: 20,
  },
});

export default EditProductScreen;