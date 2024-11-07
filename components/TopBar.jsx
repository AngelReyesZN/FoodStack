import React from "react";
import { View, Image, StyleSheet, StatusBar, TouchableOpacity } from "react-native";
import CustomText from '../components/CustomText';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useNavigation } from '@react-navigation/native';

const TopBar = ({ title, showBackButton, navigation }) => {
  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="#FF6347"
        translucent={false}
      />
      {showBackButton && (
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Icon name="chevron-left" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      )}
      <CustomText style={styles.text} fontWeight="Medium">
        {showBackButton ? title : 'Food Stack'}
      </CustomText>
      {!showBackButton && (
        <Image source={require("../assets/FoodStackLogoNT.png")} style={styles.logo} />
      )}
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
  backButton: {
    zIndex: 10, // Asegura que el botón esté por encima de otros elementos
  },
  logo: {
    width: 40,
    height: 40,
  },
  text: {
    fontSize: 22,
    color: "#FFFFFF",
    textAlign: "center",
    flex: 1,
  },
});

export default TopBar;