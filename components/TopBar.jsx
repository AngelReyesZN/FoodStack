import React from "react";
import { View, Image, StyleSheet, StatusBar} from "react-native";
import CustomText from '../components/CustomText';


const TopBar = () => {
  return (
    <View style={styles.container}>
       <StatusBar
        barStyle="light-content"
        backgroundColor="#FF6347"
        translucent={false}
      />
      {/* Logo de la aplicación */}
      <Image source={require("../assets/FoodStackLogoNT.png")} style={styles.logo} />
      {/* Texto "CHANGARRITO FIF" */}
      <CustomText style={styles.text} fontWeight="Medium">Food Stack</CustomText>
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
  },
  logo: {
    width: 40,
    height: 40,
    marginRight: 10,
  },
  text: {
    fontSize: 22,
    color: "#FFFFFF",
  },
});

export default TopBar;