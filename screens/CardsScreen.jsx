import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, TextInput, TouchableOpacity, ScrollView, Keyboard, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { db, auth } from '../services/firebaseConfig';
import { collection, query, where, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';

import TopBar from '../components/TopBar';
import BottomMenuBar from '../components/BottomMenuBar';
import BackButton from '../components/BackButton';

const CardsScreen = () => {
  const [titular, setTitular] = useState('');
  const [numCuenta, setNumCuenta] = useState('');
  const [banco, setBanco] = useState('');
  const [cards, setCards] = useState([]);
  const [editingCard, setEditingCard] = useState(null);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const currentUserEmail = auth.currentUser.email;
  const navigation = useNavigation();

  const fetchCards = async () => {
    try {
      const userQuery = query(collection(db, 'usuarios'), where('correo', '==', currentUserEmail));
      const userSnapshot = await getDocs(userQuery);
      if (!userSnapshot.empty) {
        const userRef = userSnapshot.docs[0].ref;

        const cardsQuery = query(collection(db, 'tarjetas'), where('usuarioRef', '==', userRef));
        const cardsSnapshot = await getDocs(cardsQuery);
        const loadedCards = cardsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setCards(loadedCards);
      } else {
        console.error('Usuario no encontrado');
      }
    } catch (error) {
      console.error('Error fetching cards:', error);
    }
  };

  useEffect(() => {
    fetchCards();

    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => {
      setKeyboardVisible(true);
    });
    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardVisible(false);
    });

    return () => {
      keyboardDidHideListener.remove();
      keyboardDidShowListener.remove();
    };
  }, [currentUserEmail]);

  const handleAddOrUpdateCard = async () => {
    if (titular.trim() && numCuenta.trim() && banco.trim()) {
      try {
        const userQuery = query(collection(db, 'usuarios'), where('correo', '==', currentUserEmail));
        const userSnapshot = await getDocs(userQuery);
        if (!userSnapshot.empty) {
          const userRef = userSnapshot.docs[0].ref;

          if (editingCard) {
            await updateDoc(doc(db, 'tarjetas', editingCard.id), {
              titular,
              numCuenta,
              banco,
              usuarioRef: userRef,
            });
            Alert.alert('Éxito', 'Tarjeta actualizada correctamente');
          } else {
            await addDoc(collection(db, 'tarjetas'), {
              titular,
              numCuenta,
              banco,
              usuarioRef: userRef,
            });
            Alert.alert('Éxito', 'Tarjeta agregada correctamente');
          }

          fetchCards();
          setTitular('');
          setNumCuenta('');
          setBanco('');
          setEditingCard(null);
        } else {
          console.error('Usuario no encontrado');
        }
      } catch (error) {
        console.error('Error adding/updating card:', error);
      }
    } else {
      Alert.alert('Error', 'Por favor complete todos los campos');
    }
  };

  const handleEditCard = (card) => {
    setTitular(card.titular);
    setNumCuenta(card.numCuenta);
    setBanco(card.banco);
    setEditingCard(card);
  };

  const handleDeleteCard = async (cardId) => {
    try {
      await deleteDoc(doc(db, 'tarjetas', cardId));
      Alert.alert('Éxito', 'Tarjeta eliminada correctamente');
      fetchCards();
    } catch (error) {
      console.error('Error deleting card:', error);
    }
  };

  return (
    <View style={styles.container}>
      <TopBar />
      <View style={styles.headerContainer}>
        <BackButton onPress={() => navigation.goBack()} />
        <Text style={styles.title}>Mis tarjetas</Text>
      </View>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.formContainer}>
          <TextInput
            style={styles.input}
            placeholder="Titular"
            value={titular}
            onChangeText={setTitular}
          />
          <TextInput
            style={styles.input}
            placeholder="No. de Cuenta"
            value={numCuenta}
            onChangeText={setNumCuenta}
            keyboardType="numeric"
          />
          <TextInput
            style={styles.input}
            placeholder="Banco"
            value={banco}
            onChangeText={setBanco}
          />
          <TouchableOpacity style={styles.button} onPress={handleAddOrUpdateCard}>
            <Text style={styles.buttonText}>{editingCard ? 'Actualizar Tarjeta' : 'Agregar Tarjeta'}</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.cardsContainer}>
          {cards.map(card => (
            <View key={card.id} style={styles.cardItem}>
              <Text style={styles.cardTitle}>{card.titular}</Text>
              <Text style={styles.cardText}>Cuenta: {card.numCuenta}</Text>
              <Text style={styles.cardText}>Banco: {card.banco}</Text>
              <View style={styles.cardActions}>
                <TouchableOpacity onPress={() => handleEditCard(card)}>
                  <Text style={styles.editText}>Editar</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDeleteCard(card.id)}>
                  <Text style={styles.deleteText}>Eliminar</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
      {!keyboardVisible && <BottomMenuBar isMenuScreen={true} />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
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
    marginBottom: 10,

  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  formContainer: {
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#030A8C',
    padding: 15,
    marginRight: 30,
    marginLeft:30,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
  cardsContainer: {
    marginBottom: 20,
  },
  cardItem: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#030A8C',
  },
  cardText: {
    fontSize: 16,
    marginBottom: 5,
    color: '#666',
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  editText: {
    color: '#007bff',
    fontSize: 16,
  },
  deleteText: {
    color: '#d9534f',
    fontSize: 16,
  },
});

export default CardsScreen;
