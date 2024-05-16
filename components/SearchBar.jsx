import React, { useState } from 'react';
import { View, TextInput, StyleSheet, Image, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import LogoImage from '../assets/Logo.png';
import { useNavigation } from '@react-navigation/native';

const SearchBar = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const navigation = useNavigation();

  const handleSearch = () => {
    navigation.navigate('SearchResults', { searchQuery });
  };

  return (
    <View style={styles.container}>
      <Image
        source={LogoImage}
        style={{ width: 40, height: 40, marginRight: 10, marginTop: 10 }}
      />
      
      <TextInput onPress={handleSearch}
        style={styles.searchInput}
        placeholder="Buscar en changarrito"
        value={searchQuery}
        onChangeText={handleSearch}
      />

      <TouchableOpacity onPress={handleSearch}>
        <Icon name="search" size={20} color="#000" style={{ marginLeft: 10 }} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingTop: 15,
    paddingBottom: 5,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  searchInput: {
    flex: 1,
    height: 30,
    borderWidth: 1,
    borderColor: '#ccc',
    paddingLeft: 10,
    borderRadius: 5,
    borderColor: 'white',
    marginTop: 8,
  },
});

export default SearchBar;
