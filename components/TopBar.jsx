import React from "react";
import { View, Image, StyleSheet, StatusBar, TouchableOpacity } from "react-native";
import CustomText from '../components/CustomText';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useNavigation } from '@react-navigation/native';
import SearchBar from '../components/SearchBar'; // Importa el componente SearchBar
import CustomText2 from "./CustomText2";

const TopBar = ({ title, showBackButton, showSearchBar, navigation }) => {
  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="#FF6347"
        translucent={false}
      />
      <View style={styles.leftContainer}>
        {showBackButton && (
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Icon name="chevron-left" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        )}
        {!showBackButton && (
          <Image source={require("../assets/FoodStackLogoNT.png")} style={styles.logo} />
        )}
      </View>
      {showSearchBar ? (
        <SearchBar />
      ) : (
        <View style={styles.titleContainer}>
          <CustomText2 style={styles.text} variant='caption'>
            {showBackButton ? title : 'Food Stack'}
          </CustomText2>
        </View>
      )}
      <View style={styles.rightContainer} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FF6347",
    height: 60,
    elevation: 5,
    justifyContent: "space-between", // Ajustar elementos a los extremos
    paddingHorizontal: 10, // Espaciado consistente
  },
  leftContainer: {
    width: 40, // Ancho fijo para el contenedor izquierdo
    alignItems: 'flex-start',
  },
  rightContainer: {
    width: 40, // Ancho fijo para el contenedor derecho
  },
  backButton: {
    zIndex: 10, // Asegura que el botón esté por encima de otros elementos
  },
  logo: {
    width: 40,
    height: 40,
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center', // Centra el título horizontalmente
  },
  text: {
    fontSize: 22,
    color: "#FFFFFF",
    textAlign: "center",
  },
});

export default TopBar;