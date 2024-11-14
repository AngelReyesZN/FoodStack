import React, { useState } from 'react';
import { View, TextInput, StyleSheet, Image, TouchableOpacity, StatusBar, Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useNavigation } from '@react-navigation/native';
import CustomText from '../components/CustomText';
import LogoImage from '../assets/FoodStackLogoNT.png';

const SearchBar = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const navigation = useNavigation();

  const handleSearch = () => {
    navigation.navigate('Search', { searchQuery });
  };

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="#FF6347"
        translucent={false}
      />
      <Image
        source={LogoImage}
        style={{ width: 50, height: 50, marginRight: width * 0.015 }}
      />
      <View style={styles.inputWrapper}>
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar productos..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={handleSearch}
        />
        <TouchableOpacity onPress={handleSearch} style={styles.iconContainer}>
          <Icon name="search" size={20} color="#AEAEAE" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const { width, height } = Dimensions.get('window');
const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF6347',
    paddingTop: height * 0.02, // 2% del alto de la pantalla
    paddingBottom: height * 0.02, // 2% del alto de la pantalla
    paddingHorizontal: width * 0.02, // 2% del ancho de la pantalla
    elevation: 5, // Sombra para resaltar la barra superior
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    marginRight: height * 0.02, // 2% del alto de la pantalla
    flex: 1,
    borderRadius: 10,
  },
  searchInput: {
    flex: 1,
    height: height * 0.06, // 6% del alto de la pantalla
    paddingLeft: width * 0.04, // 4% del ancho de la pantalla
    fontFamily: 'Montserrat-Regular',
  },
  iconContainer: {
    paddingHorizontal: width * 0.025, // 2.5% del ancho de la pantalla
  },
});

export default SearchBar;