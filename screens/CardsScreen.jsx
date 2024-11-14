import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, TextInput, TouchableOpacity, ScrollView, Keyboard, Alert, Image, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { db, auth } from '../services/firebaseConfig';
import { collection, query, where, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import CustomText from '../components/CustomText';
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
      <TopBar title="Mis tarjetas" showBackButton={true} navigation={navigation} showSearchBar={false} />


      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Image
          source={require('../assets/cardImage.png')}
          style={styles.cardImage}
        />
        <CustomText style={styles.cardLabel} fontWeight='Medium'>Los datos que vas a ingresar a continuación son los datos necesarios para que tus clientes puedan transferirte el costo de tu producto.</CustomText>
        <View style={styles.formContainer}>
          <CustomText style={styles.subtitle} fontWeight='Medium'>Titular de la tarjeta</CustomText>
          <TextInput
            style={styles.input}
            placeholder="Titular"
            value={titular}
            onChangeText={setTitular}
          />
          <CustomText style={styles.subtitle} fontWeight='Medium'>Número de cuenta</CustomText>

          <TextInput
            style={styles.input}
            placeholder="No. de Cuenta"
            value={numCuenta}
            onChangeText={setNumCuenta}
            keyboardType="numeric"
          />
          <CustomText style={styles.subtitle} fontWeight='Medium'>Banco al que pertenece la tarjeta</CustomText>

          <TextInput
            style={styles.input}
            placeholder="Banco"
            value={banco}
            onChangeText={setBanco}
          />
          <TouchableOpacity style={styles.button} onPress={handleAddOrUpdateCard}>
            <CustomText style={styles.buttonText} fontWeight='Bold'>{editingCard ? 'Actualizar Tarjeta' : 'Agregar Tarjeta'}</CustomText>
          </TouchableOpacity>
        </View>
        <View style={styles.cardsContainer}>
          {cards.map(card => (
            <View key={card.id} style={styles.cardItem}>
              <CustomText style={styles.cardTitle} fontWeight='SemiBold'>{card.titular}</CustomText>
              <CustomText style={styles.cardText}>Cuenta: {card.numCuenta}</CustomText>
              <CustomText style={styles.cardText}>Banco: {card.banco}</CustomText>
              <View style={styles.cardActions}>
                <TouchableOpacity onPress={() => handleEditCard(card)}>
                  <CustomText style={styles.editText} fontWeight='SemiBold'>Editar</CustomText>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDeleteCard(card.id)}>
                  <CustomText style={styles.deleteText}>Eliminar</CustomText>
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

const { width, height } = Dimensions.get('window');
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    justifyContent: 'center',
    paddingBottom: height * .1,
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
  cardImage: {
    height: 85,
    width: 85,
    resizeMode: 'contain',
    alignSelf: 'center',
    marginTop: 50,
    marginBottom: 20,
  },
  cardLabel: {
    fontSize: 14,
    color: '#848484',
    padding: 15,
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    color: 'black',
    fontSize: 15,
    paddingBottom: 10,
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
    borderWidth: 1.5,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
    fontSize: 14,
    fontFamily: 'Montserrat-Medium'
  },
  button: {
    backgroundColor: '#FF6347',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
    elevation: 3,
  },
  buttonText: {
    color: '#fff',
    fontSize: 13,
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
    marginBottom: 5,
    color: '#FF6347',
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
    color: 'black',
    fontSize: 16,
  },
  deleteText: {
    color: '#C3AFAF',
    fontSize: 16,
    textDecorationLine: 'underline', // Subrayado

  },
});

export default CardsScreen;
