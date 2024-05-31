import { View, Text, StyleSheet, Image, TouchableOpacity, TextInput } from 'react-native';
import TopBar from '../components/TopBar';
import BottomMenuBar from '../components/BottomMenuBar';
import BackButton from '../components/BackButton';
import { useNavigation } from '@react-navigation/native';

const HistoryScreen = () => {

    const navigation = useNavigation();

    const navigateToScreen = (screenName) => {
        navigation.navigate(screenName);
    };

  return (
    <View style={styles.container}>
      <TopBar />
      <View style={styles.headerContainer}>
        <BackButton />
        <Text style={styles.title}>Historial</Text>
      </View>

      <View>
        <TouchableOpacity style={styles.buttonCompras} onPress={() => navigateToScreen('Purchase')}>
            <Text style={styles.textButton}>Compras</Text>
            <Image source={require('../assets/rscMenu/bolsa.png')}/>
        </TouchableOpacity>
        <TouchableOpacity style={styles.buttonVentas} onPress={() => navigateToScreen('Sell')}>
            <Text style={styles.textButton}>Ventas</Text>
            <Image source={require('../assets/rscMenu/bolsaVenta.png')}/>
        </TouchableOpacity>
      </View>


      <BottomMenuBar isMenuScreen={true} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 10,
  },
  title: {
    fontSize: 22,
        fontWeight: 'bold',
        color: '#030A8C',
        marginLeft: 10,
  },
  buttonCompras: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#030A8C',
    borderRadius: 5,
    paddingVertical: 25,
    paddingHorizontal: 25,
    margin: 20,
    marginBottom: 0,
  },
    buttonVentas: {
    flexDirection: 'row',
    justifyContent: 'space-between',
        backgroundColor: '#4145a6',
        borderRadius: 5,
        paddingVertical: 25,
        paddingHorizontal: 25,
        margin: 20,
    },
    textButton: {
        color: 'white',
        fontSize: 20,
        margin: 10,
    },
});

export default HistoryScreen;