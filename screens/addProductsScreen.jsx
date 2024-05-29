import React, { useState, useContext, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Image, Alert, ScrollView } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Picker } from '@react-native-picker/picker';
import { collection, getDocs, query, where, doc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../services/firebaseConfig';
import TopBar from '../components/TopBar';
import BottomMenuBar from '../components/BottomMenuBar';
import BackButton from '../components/BackButton';
import { ProductContext } from '../context/ProductContext';
import { UserContext } from '../context/UserContext';

const AddProductsScreen = ({ navigation }) => {
  const [productName, setProductName] = useState('');
  const [productPrice, setProductPrice] = useState('');
  const [productUnits, setProductUnits] = useState('');
  const [productCategory, setProductCategory] = useState('');
  const [productImage, setProductImage] = useState(null);
  const { addProduct } = useContext(ProductContext);
  const { user } = useContext(UserContext);
  const [userDocId, setUserDocId] = useState('');

  useEffect(() => {
    const fetchUserDocId = async () => {
      const q = query(collection(db, 'usuarios'), where('correo', '==', user.correo));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const userDoc = querySnapshot.docs[0];
        setUserDocId(userDoc.id);
      } else {
        console.error('No se encontró el usuario');
      }
    };

    fetchUserDocId();
  }, [user]);

  const handleChooseImage = async () => {
    let permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted === false) {
      Alert.alert('Permission to access camera roll is required!');
      return;
    }

    let pickerResult = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: false, // Desactiva la funcionalidad de recorte
    });
    console.log('Picker result:', pickerResult);
    if (pickerResult.cancelled === true) {
      return;
    }

    if (pickerResult.assets.length > 0 && pickerResult.assets[0].uri) {
      setProductImage(pickerResult.assets[0].uri);
    }
  };

  const handlePublishProduct = async () => {
    if (productName && productPrice && productUnits && productImage && productCategory) {
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
          imagen: imageUrl,
          categoria: productCategory,
          fotoVendedorRef: userDocRef,
          vendedorRef: userDocRef,
        };

        // Agregar el nuevo producto a Firestore
        await setDoc(doc(db, 'productos', newProductId), newProduct);

        // Agregar el producto al contexto (opcional, dependiendo de tu lógica)
        addProduct(newProduct);

        // Navegar a la pantalla de productos cargados
        navigation.navigate('LoadProduct');
      } catch (error) {
        console.error("Error al agregar el producto:", error);
        Alert.alert("Error", "Hubo un problema al agregar el producto.");
      }
    } else {
      Alert.alert('Por favor completa todos los campos');
    }
  };

  return (
    <View style={styles.container}>
      <TopBar />
      <View style={styles.headerContainer}>
        <BackButton />
        <Text style={styles.title}>Publicar Producto</Text>
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.formContainer}>
          <Text style={styles.label}>Nombre del Producto</Text>
          <TextInput
            style={styles.input}
            value={productName}
            onChangeText={setProductName}
          />
          <Text style={styles.label}>Categoría del Producto</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={productCategory}
              style={styles.picker}
              onValueChange={(itemValue) => setProductCategory(itemValue)}
            >
              <Picker.Item label="Selecciona una categoría" value="" />
              <Picker.Item label="Frituras" value="Frituras" />
              <Picker.Item label="Dulces" value="Dulces" />
              <Picker.Item label="Comida" value="Comida" />
              <Picker.Item label="Postres" value="Postres" />
              <Picker.Item label="Dispositivos" value="Dispositivos" />
              <Picker.Item label="Otros" value="Otros" />
            </Picker>
          </View>
          <View style={styles.row}>
            <View style={styles.columnSmall}>
              <Text style={styles.label}>Precio</Text>
              <View style={styles.inputContainer}>
                <Text style={styles.prefix}>$ </Text>
                <TextInput
                  style={[styles.input, styles.inputWithoutBorder]}
                  value={productPrice}
                  onChangeText={setProductPrice}
                  keyboardType="numeric"
                />
              </View>
            </View>
            <View style={styles.columnLarge}>
              <Text style={styles.label}>Unidades</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={[styles.input, styles.inputWithoutBorder]}
                  value={productUnits}
                  onChangeText={setProductUnits}
                  keyboardType="numeric"
                />
                <Text style={styles.suffix}> piezas</Text>
              </View>
            </View>
          </View>
          <Text style={styles.labelImage}>Imagen del Producto</Text>
          <TouchableOpacity style={styles.imagePicker} onPress={handleChooseImage}>
            {productImage ? (
              <Image source={{ uri: productImage }} style={styles.imagePreview} />
            ) : (
              <>
                <Image source={require('../assets/rscMenu/addImage.png')} style={styles.imagePlaceholder} />
              </>
            )}
          </TouchableOpacity>
          <TouchableOpacity style={styles.publishButton} onPress={handlePublishProduct}>
            <Text style={styles.publishButtonText}>Publicar producto</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      <BottomMenuBar />
    </View>
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
    marginTop: 10,
  },
  title: {
    paddingLeft: 10,
    alignItems: 'center',
    fontSize: 23,
    fontWeight: 'bold',
    color: '#030A8C',
  },
  formContainer: {
    paddingLeft: 20,
    paddingRight: 20,
  },
  label: {
    fontSize: 18,
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
    borderWidth: 1,
    borderColor: '#ccc',
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
    fontSize: 16,
    color: '#000',
    fontWeight: 'bold',
  },
  suffix: {
    fontSize: 16,
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
    opacity: 0.6,
  },
  labelImage: {
    fontSize: 18,
    color: '#000',
    marginBottom: 4,
    marginTop: 20,
  },
  publishButton: {
    backgroundColor: '#030A8C',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
    marginTop: 20,
    alignItems: 'center',
    alignSelf: 'flex-end',
  },
  publishButtonText: {
    color: 'white',
    fontSize: 16,
  },
});

export default AddProductsScreen;