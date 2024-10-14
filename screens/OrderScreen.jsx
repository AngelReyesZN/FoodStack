import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, Image, TouchableOpacity, Modal, TextInput, Platform, ScrollView, Alert, Linking, KeyboardAvoidingView, Keyboard } from 'react-native';
import { collection, query, where, getDocs, doc, getDoc, addDoc, updateDoc } from 'firebase/firestore';
import * as Clipboard from 'expo-clipboard';
import { db, auth } from '../services/firebaseConfig';
import { useRoute } from '@react-navigation/native';
import { agregarNotificacion } from '../services/notifications';
import TopBar from '../components/TopBar';
import BackButton from '../components/BackButton';
import BottomMenuBar from '../components/BottomMenuBar';
import clock from '../assets/rscMenu/reloj.png';
import cash from '../assets/rscMenu/cash.png';
import card from '../assets/rscMenu/card.png';
import ErrorAlert from '../components/ErrorAlert';

const OrderScreen = ({ navigation }) => {
  const route = useRoute();
  const { productId, quantity } = route.params;

  const [product, setProduct] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [showError, setShowError] = useState(false);
  const [statusCard, setStatusCard] = useState(false);
  const [tarjeta, setTarjeta] = useState(null);
  const [instructions, setInstructions] = useState('');
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const productDoc = await getDoc(doc(db, 'productos', productId));
        if (productDoc.exists()) {
          const productData = productDoc.data();
          const vendorDoc = await getDoc(productData.vendedorRef);
          const vendorData = vendorDoc.exists() ? vendorDoc.data() : null;
          setProduct({ ...productData, vendedor: vendorData, id: productDoc.id });

          // Set the statusCard
          setStatusCard(vendorData.statusCard);
        } else {
          console.error("Producto no encontrado");
        }
      } catch (error) {
        console.error("Error al cargar el producto:", error);
      }
    };

    fetchProduct();
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

  const handlePaymentMethod = async (method, image) => {
    setPaymentMethod(method);
    setSelectedImage(image);
    setModalVisible(false);

    if (method === 'Tarjeta de crédito/débito') {
      const userQuery = query(collection(db, 'tarjetas'), where('usuarioRef', '==', product.vendedorRef));
      const userSnapshot = await getDocs(userQuery);
      if (!userSnapshot.empty) {
        const tarjetaData = userSnapshot.docs[0].data();
        setTarjeta(tarjetaData);
      }
    }
  };

  const handleWhatsApp = async () => {
    const phoneNumber = product.vendedor?.telefono;
    if (phoneNumber) {
      const url = `whatsapp://send?phone=${phoneNumber}`;
      Linking.openURL(url)
        .catch(() => {
          Alert.alert('Error', 'No se pudo abrir WhatsApp. Asegúrate de que esté instalado.');
        });
    } else {
      Alert.alert('Error', 'Número de teléfono no disponible.');
    }
    const userQuery = query(collection(db, 'usuarios'), where('correo', '==', auth.currentUser.email));
    const userSnapshot = await getDocs(userQuery);
    if (!userSnapshot.empty) {
      const userDocRef = userSnapshot.docs[0].ref;
      await agregarNotificacion(userDocRef, 'Te comunicaste con un vendedor');
    }
  };

  const handleConfirmPurchase = async () => {
    if (!paymentMethod) {
      setShowError(true);
      return;
    }

    if (quantity <= 0 || quantity > product.cantidad) {
      Alert.alert('Error', 'La cantidad debe ser mayor a 0 y no puede exceder la disponibilidad.');
      return;
    }

    try {
      // Obtener la referencia del comprador
      const userQuery = query(collection(db, 'usuarios'), where('correo', '==', auth.currentUser.email));
      const userSnapshot = await getDocs(userQuery);
      let compradorRef = null;
      if (!userSnapshot.empty) {
        compradorRef = userSnapshot.docs[0].ref;
      }

      if (compradorRef && product) {
        // Calcular el total pagado
        const totalPagado = product.precio * quantity;

        const productoRef = doc(db, 'productos', product.id);

        // Agregar la orden
        const orderRef = await addDoc(collection(db, 'ordenes'), {
          productoRef: productoRef,
          vendedorRef: product.vendedorRef,
          cantidad: quantity,
          metodoPago: paymentMethod,
          compradorRef: compradorRef,
          fecha: new Date(),
          totalPagado: totalPagado, // Añadir el total pagado
          instrucciones: instructions, // Añadir las instrucciones
        });

        // Actualizar la cantidad de producto
        const nuevaCantidad = product.cantidad - quantity;
        await updateDoc(productoRef, { cantidad: nuevaCantidad });

        // Preparar la información para copiar al portapapeles
        let clipboardContent = `Compra confirmada:
Producto: ${product.nombre}
Cantidad: ${quantity}
Vendedor: ${product.vendedor.nombre}
Total: $${totalPagado}.00
Método de pago: ${paymentMethod}`;

        if (paymentMethod === 'Tarjeta de crédito/débito') {
          clipboardContent += `
Datos de la tarjeta:
Banco: ${tarjeta.banco}
Número de cuenta: ${tarjeta.numCuenta}
Titular: ${tarjeta.titular}`;
        }

        if (instructions.trim() !== '') {
          clipboardContent += `
Instrucciones: ${instructions}`;
        }

        // Copiar al portapapeles
        await Clipboard.setStringAsync(clipboardContent);

        Alert.alert(
          'Compra confirmada',
          'Tu orden ha sido registrada exitosamente. Comunícate con el vendedor.',
          [
            {
              text: 'OK',
              onPress: handleWhatsApp,
            },
          ]
        );
        navigation.goBack();
      } else {
        Alert.alert('Error', 'No se pudo encontrar el comprador o el producto.');
      }
    } catch (error) {
      console.error('Error confirmando la compra:', error);
      Alert.alert('Error', 'No se pudo confirmar la compra. Inténtalo de nuevo.');
    }
  };

  if (!product) {
    return <Text>Cargando...</Text>;
  }

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <TopBar />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerContainer}>
          <BackButton style={styles.backButton} />
          <Text style={styles.title}>Tu Orden</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.totalContainer}>
          <Text style={styles.totalLabel}>Total</Text>
        </View>
        <View style={styles.productRow}>
          <View style={styles.quantityBox}>
            <Text style={styles.quantityText}>{quantity}</Text>
          </View>
          <Text style={styles.productText}>{product.nombre}</Text>
          <Text style={styles.quantityText1}>({quantity}) </Text>
          <Text style={styles.priceText}>${product.precio.toFixed(2)}</Text>
        </View>
        <View style={styles.separator} />
        <View style={styles.containerTotal}>
          <Text style={styles.TotalText}>Total a pagar</Text>
          <Text style={styles.sumaTotal}>${(product.precio * quantity).toFixed(2)}</Text>
        </View>
        <View style={styles.separator} />
        <View style={styles.containerEntrega}>
          <Text style={styles.entrega}>Tiempo de entrega</Text>
          <Image source={clock} style={styles.imageClock} />
        </View>
        <View style={styles.estimatedTimeContainer}>
          <Text style={styles.estimatedTimeText}>
            Tiempo de entrega estimado de <Text style={styles.blueText}>15min</Text>
          </Text>
        </View>
        <View style={styles.separator} />
        <View style={styles.methodOfPaymentContainer}>
          <Text style={styles.methodOfPaymentText}>Método de pago</Text>
        </View>
        <View style={styles.pickerContainer}>
          <TouchableOpacity
            style={styles.pickerButton}
            onPress={() => setModalVisible(true)}
          >
            {selectedImage && <Image source={selectedImage} style={styles.icon} />}
            <Text style={styles.pickerButtonText}>
              {paymentMethod || 'Selecciona un método de pago'}
            </Text>
          </TouchableOpacity>
        </View>
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => {
            setModalVisible(!modalVisible);
          }}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <TouchableOpacity
                style={styles.optionButton}
                onPress={() => handlePaymentMethod('Efectivo', cash)}
              >
                <Image source={cash} style={styles.icon} />
                <Text style={styles.optionText}>Efectivo</Text>
              </TouchableOpacity>
              {statusCard && (
                <TouchableOpacity
                  style={styles.optionButton}
                  onPress={() => handlePaymentMethod('Tarjeta de crédito/débito', card)}
                >
                  <Image source={card} style={styles.icon} />
                  <Text style={styles.optionText}>Tarjeta de crédito/débito</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </Modal>
        {showError && (
          <ErrorAlert
            message="Por favor completa todos los campos"
            onClose={() => setShowError(false)}
          />
        )}
        <View style={styles.separator} />
        <View style={styles.instructionsContainer}>
          <Text style={styles.instructionsText}>Instrucciones</Text>
        </View>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={instructions}
            onChangeText={setInstructions}
          />
          <Text style={styles.helperText}>Agrega instrucciones específicas para tu entrega (opcional)</Text>
        </View>
        <View style={styles.confirmButtonContainer}>
          <TouchableOpacity style={styles.confirmButton} onPress={handleConfirmPurchase}>
            <Text style={styles.confirmButtonText}>Confirmar Compra</Text>
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
    paddingBottom: 100, // Ajusta el padding inferior según sea necesario
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginTop: 10,
  },
  backButton: {
    position: 'absolute',
    left: 0,
  },
  title: {
    flex: 1,
    textAlign: 'center',
    fontSize: 24,
    fontWeight: 'bold',
  },
  placeholder: {
    width: 50,
  },
  totalContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 25,
    marginTop: 10,
  },
  totalLabel: {
    fontSize: 21,
    fontWeight: 'bold',
  },
  productRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 25,
    marginTop: 20,
  },
  quantityBox: {
    width: 40,
    height: 40,
    backgroundColor: '#D3D3D3',
    justifyContent: 'center',
    borderRadius: 10,
    alignItems: 'center',
    marginRight: 10,
  },
  quantityText: {
    color: 'black',
    fontWeight: 'bold',
    fontSize: 20,
  },
  quantityText1: {
    color: 'gray',
    paddingBottom: 2,
    fontSize: 19,
  },
  productText: {
    flex: 1,
    paddingLeft: 10,
    fontWeight: 'bold',
    fontSize: 20,
  },
  priceText: {
    fontSize: 20,
    color: '#030A8C',
  },
  separator: {
    height: 1,
    backgroundColor: '#D3D3D3',
    marginHorizontal: 25,
    marginTop: 20,
  },
  containerTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 25,
    marginTop: 20,
  },
  TotalText: {
    flex: 1,
    paddingLeft: 10,
    fontWeight: 'bold',
    fontSize: 20,
  },
  sumaTotal: {
    fontSize: 20,
    color: '#030A8C',
    fontWeight: 'bold',
  },
  containerEntrega: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 25,
    marginTop: 20,
  },
  entrega: {
    marginLeft: 10,
    fontWeight: 'bold',
    fontSize: 20,
  },
  imageClock: {
    marginTop: 5,
    marginLeft: 5,
    width: 24,
    height: 24,
  },
  estimatedTimeContainer: {
    paddingHorizontal: 35,
    marginTop: 18,
  },
  estimatedTimeText: {
    fontSize: 18,
  },
  blueText: {
    color: '#030A8C',
    fontWeight: 'bold',
  },
  methodOfPaymentContainer: {
    paddingHorizontal: 35,
    marginTop: 10,
  },
  methodOfPaymentText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  pickerContainer: {
    paddingTop: 8,
    paddingHorizontal: 35,
    marginBottom: 10,
  },
  pickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderWidth: 1,
    borderRadius: 5,
  },
  pickerButtonText: {
    paddingLeft: 10,
    fontSize: 19,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    marginBottom: 10,
  },
  icon: {
    width: 30,
    height: 30,
    marginHorizontal: 8,
  },
  optionText: {
    fontSize: 19,
  },
  instructionsContainer: {
    paddingHorizontal: 35,
    marginTop: 10,
  },
  instructionsText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  inputContainer: {
    paddingHorizontal: 35,
    marginTop: 10,
  },
  input: {
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    width: '70%',
  },
  helperText: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
  },
  confirmButtonContainer: {
    paddingHorizontal: 35,
    marginTop: 20,
    marginBottom: 20, // Añade un margen inferior para que no se amontone con el BottomMenuBar
  },
  confirmButton: {
    backgroundColor: '#030A8C',
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 10,
  },
  confirmButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default OrderScreen;