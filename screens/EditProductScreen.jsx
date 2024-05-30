import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, StyleSheet, Image, TouchableOpacity, ScrollView } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { getAuth } from 'firebase/auth';
import { doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
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

  useEffect(() => {
    const fetchProductData = async () => {
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
    };

    fetchProductData();
  }, [productId]);

  const handleSave = async () => {
    await updateDoc(doc(db, 'productos', productId), {
      nombre,
      precio: parseFloat(precio),
      cantidad: parseInt(cantidad, 10),
      descripcion,
      categoria,
      imagen,
    });
    navigation.goBack();
  };

  const handleDelete = async () => {
    await deleteDoc(doc(db, 'productos', productId));
    navigation.goBack();
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
    <View style={styles.container}>
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
            onChangeText={setDescripcion}
            multiline
          />

          <Text style={styles.label}>Imagen del producto</Text>
          <View style={styles.imageContainer}>
            <Image source={{ uri: imagen }} style={styles.productImage} />
            <TouchableOpacity style={styles.editIcon}>
              <Image source={require('../assets/iconEdit.png')} style={styles.iconImage} />
            </TouchableOpacity>
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
      <BottomMenuBar isMenuScreen={true} />
    </View>
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
  },
  label: {
    fontSize: 17,
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
    marginBottom: 15,
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
    width: 80,
    height: 80,
    borderRadius: 10,
    marginBottom: 10,
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
