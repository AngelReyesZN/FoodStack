import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, FlatList, ActivityIndicator, Image } from 'react-native';
import { getDocs, query, collection, where, doc, getDoc } from 'firebase/firestore';
import { db, auth } from '../services/firebaseConfig';

import TopBar from '../components/TopBar';
import BottomMenuBar from '../components/BottomMenuBar';
import BackButton from '../components/BackButton';

import cashIcon from '../assets/rscMenu/cash.png'; // Asegúrate de tener este icono
import cardIcon from '../assets/rscMenu/card.png'; // Asegúrate de tener este icono

const PurchaseScreen = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const userEmail = auth.currentUser.email;

        const userQuery = query(collection(db, 'usuarios'), where('correo', '==', userEmail));
        const userSnapshot = await getDocs(userQuery);
        let userDocRef = null;
        if (!userSnapshot.empty) {
          userDocRef = userSnapshot.docs[0].ref;
        } else {
          console.error('Usuario no encontrado');
          setLoading(false);
          return;
        }

        const ordersQuery = query(collection(db, 'ordenes'), where('compradorRef', '==', userDocRef));
        const querySnapshot = await getDocs(ordersQuery);

        const ordersData = await Promise.all(
          querySnapshot.docs.map(async doc => {
            const orderData = doc.data();
            const productDoc = await getDoc(orderData.productoRef);
            const vendorDoc = await getDoc(orderData.vendedorRef);

            return {
              id: doc.id,
              ...orderData,
              producto: productDoc.exists() ? productDoc.data() : null,
              vendedor: vendorDoc.exists() ? vendorDoc.data() : null,
            };
          })
        );

        setOrders(ordersData);
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const renderOrder = ({ item }) => {
    const purchaseDate = item.fecha.toDate().toLocaleDateString('es-MX', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });

    return (
      <View style={styles.orderItem}>
        <View style={styles.imageContainer}>
          {item.producto && <Image source={{ uri: item.producto.imagen }} style={styles.productImage} resizeMode="contain" />}
        </View>
        <View style={styles.detailsContainer}>
          <View style={styles.header}>
            <View style={styles.quantityCircle}>
              <Text style={styles.quantityText}>{item.cantidad}</Text>
            </View>
            <Text style={styles.productName} numberOfLines={1} ellipsizeMode="tail">{item.producto.nombre}</Text>
            <Text style={styles.date}>{purchaseDate}</Text>
          </View>
          <Text style={styles.price}>${item.producto.precio}.00</Text>
          <Text style={styles.vendorName}>Vendedor: {item.vendedor.nombre}</Text>
        </View>
        <View style={styles.paymentInfoContainer}>
          <View style={styles.totalContainer}>
            <Text style={styles.totalLabel}>Total:</Text>
            <Text style={styles.totalAmount}>${item.totalPagado}.00</Text>
          </View>
          <View style={styles.paymentMethodContainer}>
            <Text style={styles.methodLabel}>Método de pago:</Text>
            <View style={styles.paymentMethodDetails}>
              <Text style={styles.paymentMethod}>{item.metodoPago}</Text>
              <Image source={item.metodoPago === 'Efectivo' ? cashIcon : cardIcon} style={styles.paymentIcon} />
            </View>
          </View>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#030A8C" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TopBar />
      <View style={styles.headerContainer}>
        <BackButton />
        <Text style={styles.title}>Mis compras</Text>
      </View>
      {orders.length === 0 ? (
        <View style={styles.noOrdersContainer}>
          <Text style={styles.noOrdersText}>No has comprado nada aún</Text>
        </View>
      ) : (
        <FlatList
          data={orders}
          renderItem={renderOrder}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.ordersList}
        />
      )}
      <BottomMenuBar isMenuScreen={true} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
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
  ordersList: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    paddingBottom: 80,
  },
  orderItem: {
    padding: 15,
    marginVertical: 10,
    backgroundColor: '#fff',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
  },
  imageContainer: {
    width: '100%',
    height: 200,
    marginRight: 15,
    marginBottom: 10, 
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#f9f9f9',
    justifyContent: 'center', // Centrar la imagen verticalmente
    alignItems: 'center', // Centrar la imagen horizontalmente
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  detailsContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  quantityCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#030A8C',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  quantityText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  productName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    flexShrink: 1,
    maxWidth: '55%', // Ajusta esto para limitar el ancho del nombre del producto
  },
  date: {
    fontSize: 14,
    color: '#888',
    marginLeft: 'auto', // Alinea la fecha a la derecha
  },
  price: {
    fontSize: 16,
    fontWeight: 'normal',
    color: '#030A8C',
    marginBottom: 5,
  },
  vendorName: {
    fontSize: 14,
    color: '#888',
  },
  paymentInfoContainer: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    width: '100%',
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  totalAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#030A8C',
  },
  paymentMethodContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  methodLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  paymentMethodDetails: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  paymentMethod: {
    fontSize: 16,
    color: '#000',
    marginRight: 5,
  },
  paymentIcon: {
    width: 20,
    height: 20,
  },
  noOrdersContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noOrdersText: {
    fontSize: 18,
    color: '#666',
  },
});

export default PurchaseScreen;
