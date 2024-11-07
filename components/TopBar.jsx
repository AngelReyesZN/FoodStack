import React from "react";
import { View, Image, StyleSheet, StatusBar, TouchableOpacity } from "react-native";
import CustomText from '../components/CustomText';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useNavigation } from '@react-navigation/native';

const TopBar = ({ title, showBackButton }) => {
  const navigation = useNavigation();

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
    height: 60, // Ajusta la altura según sea necesario
    elevation: 5, // Sombra para resaltar la barra superior
    justifyContent: "center",
    position: "relative",
  },
  backButton: {
    position: "absolute",
    left: 20,
  },
  logo: {
    width: 40,
    height: 40,
    position: "absolute",
    right: 10,
  },
  text: {
    fontSize: 22,
    color: "#FFFFFF",
    textAlign: "center",
    flex: 1,
  },
});

export default TopBar;