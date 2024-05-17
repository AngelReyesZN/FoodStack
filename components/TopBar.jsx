import React from "react";
import { View, Image, Text, StyleSheet } from "react-native";

const TopBar = () => {
  return (
    <View style={styles.container}>
      {/* Logo de la aplicación */}
      <Image source={require("../assets/Logo.png")} style={styles.logo} />
      {/* Texto "CHANGARRITO FIF" */}
      <Text style={styles.text}>CHANGARRITO FIF</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ffffff",
    height: 100, // Ajusta la altura según sea necesario
    paddingHorizontal: 20,
    elevation: 8, // Sombra para resaltar la barra superior
  },
  logo: {
    width: 40,
    height: 40,
    marginRight: 10,
    marginTop: 20,
  },
  text: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#030A8C",
    marginTop: 20,
  },
});

export default TopBar;