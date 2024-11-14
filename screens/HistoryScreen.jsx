import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity, Image } from 'react-native';
import { getDocs, query, collection, where, doc, getDoc } from 'firebase/firestore';
import { db, auth } from '../services/firebaseConfig';

import TopBar from '../components/TopBar';
import BottomMenuBar from '../components/BottomMenuBar';
import BackButton from '../components/BackButton';
import CustomText from '../components/CustomText';
import { AntDesign } from '@expo/vector-icons';

const HistoryScreen = () => {
  const [orders, setOrders] = useState([]);
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isPurchasesOpen, setIsPurchasesOpen] = useState(true);
  const [isSalesOpen, setIsSalesOpen] = useState(true);

  useEffect(() => {
    const fetchOrdersAndSales = async () => {
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
        const ordersSnapshot = await getDocs(ordersQuery);

        const ordersData = await Promise.all(
          ordersSnapshot.docs.map(async (doc) => {
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

        const salesQuery = query(collection(db, 'ordenes'), where('vendedorRef', '==', userDocRef));
        const salesSnapshot = await getDocs(salesQuery);

        const salesData = await Promise.all(
          salesSnapshot.docs.map(async (doc) => {
            const saleData = doc.data();
            const productDoc = await getDoc(saleData.productoRef);
            const buyerDoc = await getDoc(saleData.compradorRef);

            return {
              id: doc.id,
              ...saleData,
              producto: productDoc.exists() ? productDoc.data() : null,
              comprador: buyerDoc.exists() ? buyerDoc.data() : null,
            };
          })
        );

        setSales(salesData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrdersAndSales();
  }, []);

  const renderOrder = ({ item }) => {
    const purchaseDate = item.fecha.toDate().toLocaleString('es-MX', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    return (
      <View style={styles.itemContainer}>
        <CustomText style={styles.dateText}>{purchaseDate}</CustomText>
        <CustomText style={styles.orderIdText}>ID: {item.id}</CustomText>
        <View style={styles.productContainer}>
          {item.producto && (
            <Image source={{ uri: item.producto.imagen }} style={styles.productImage} resizeMode="contain" />
          )}
          <View style={styles.productDetails}>
            <View style={styles.productHeader}>
              <CustomText style={styles.productName}>{item.producto?.nombre}</CustomText>
            </View>
            <CustomText style={styles.productQuantity}>
              Cantidad: {item.cantidad} | <Text style={styles.productPrice}>${item.producto?.precio}.00</Text>
            </CustomText>
          </View>
        </View>
      </View>
    );
  };

  const renderSale = ({ item }) => {
    const saleDate = item.fecha.toDate().toLocaleString('es-MX', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    return (
      <View style={styles.itemContainer}>
        <CustomText style={styles.dateText}>{saleDate}</CustomText>
        <CustomText style={styles.orderIdText}>ID: {item.id}</CustomText>
        <View style={styles.productContainer}>
          {item.producto && (
            <Image source={{ uri: item.producto.imagen }} style={styles.productImage} resizeMode="contain" />
          )}
          <View style={styles.productDetails}>
            <View style={styles.productHeader}>
              <CustomText style={styles.productName}>{item.producto?.nombre}</CustomText>
              
            </View>
            <CustomText style={styles.productQuantity}>
              Cantidad: {item.cantidad} | <Text style={styles.productPrice}>${item.producto?.precio}.00</Text>
            </CustomText>
          </View>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#FF6347" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <TopBar />
      <View style={styles.container}>
        <View style={styles.headerContainer}>
          <BackButton />
          <CustomText style={styles.title}>Historial</CustomText>
        </View>
        <View style={styles.separator} />
        <View style={styles.content}>
          <TouchableOpacity
            style={[styles.sectionHeader, isPurchasesOpen ? styles.sectionHeaderOpen : styles.sectionHeaderClosed]}
            onPress={() => setIsPurchasesOpen(!isPurchasesOpen)}
          >
            <CustomText style={styles.sectionHeaderText} fontWeight='Bold'>Compras</CustomText>
            <AntDesign
              name={isPurchasesOpen ? 'up' : 'down'}
              size={16}
              color="#000"
              style={styles.icon}
            />
          </TouchableOpacity>
          {isPurchasesOpen && (
            <View style={styles.sectionContent}>
              {orders && orders.length > 0 ? (
                <FlatList
                  data={orders}
                  keyExtractor={(item) => item.id.toString()}
                  renderItem={renderOrder}
                  contentContainerStyle={styles.listContainer}
                />
              ) : (
                <CustomText style={styles.emptyText} fontWeight='Regular'>No hay ventas.</CustomText>
              )}
            </View>
          )}

          <TouchableOpacity
            style={[styles.sectionHeader, isSalesOpen ? styles.sectionHeaderOpen : styles.sectionHeaderClosed]}
            onPress={() => setIsSalesOpen(!isSalesOpen)}
          >
            <CustomText style={styles.sectionHeaderText} fontWeight='Bold'>Ventas</CustomText>
            <AntDesign
              name={isSalesOpen ? 'up' : 'down'}
              size={16}
              color="#000"
              style={styles.icon}
            />
          </TouchableOpacity>
          {isSalesOpen && (
            <View style={styles.sectionContent}>
              {sales && sales.length > 0 ? (
                <FlatList
                  data={sales}
                  keyExtractor={(item) => item.id.toString()}
                  renderItem={renderSale}
                  contentContainerStyle={styles.listContainer}
                />
              ) : (
                <CustomText style={styles.emptyText} fontWeight='Regular'>No hay ventas.</CustomText>
              )}
            </View>
          )}
        </View>
        <BottomMenuBar />
      </View>
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
    fontSize: 24,
    color: '#000',
    textAlign: 'center',
    flex: 1,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 15,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    marginBottom: 10,
    paddingHorizontal: 8, // Ajusta el padding horizontal si es necesario
    borderBottomWidth: 1,
    borderBottomColor: '#ccc', // Color del separador
    paddingBottom: 10,
  },
  sectionHeaderOpen: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  sectionHeaderClosed: {
    borderBottomLeftRadius: 5,
    borderBottomRightRadius: 5,
  },
  sectionHeaderText: {
    fontSize: 20,
  },
  icon: {
    marginLeft: 10,
  },
  sectionContent: {
    paddingHorizontal: 10,
  },
  listContainer: {
    paddingBottom: 40,
  },
  itemContainer: {
    padding: 15,
    marginVertical: 5,
    backgroundColor: '#fff',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  dateText: {
    fontSize: 14,
    color: '#888',
    fontWeight: 'Regular',
  },
  orderIdText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
    fontWeight: 'Regular',
  },
  productContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  productImage: {
    width: 50,
    height: 50,
    marginRight: 10,
  },
  productDetails: {
    flex: 1,
  },
  productHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  productName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  detailsButton: {
    marginLeft: 10,
  },
  detailsText: {
    fontSize: 14,
    color: '#007BFF',
  },
  productQuantity: {
    fontSize: 14,
    color: '#555',
  },
  productPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000',
  },
  emptyText: {
    textAlign: 'center',
    marginVertical: 10,
    color: '#777',
  },
  separator: {
    height: 1,
    backgroundColor: '#C1C1C1',
    width: '85%',
    alignSelf: 'center',
    marginTop: 20,
    marginBottom: 10,
  },
});

export default HistoryScreen;
