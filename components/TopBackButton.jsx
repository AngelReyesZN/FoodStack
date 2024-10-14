import React from "react";
import { View, Image, Text, StyleSheet } from "react-native";
import BackButton from './BackButton';


const TopBackButton = () => {
  return (
    <View style={styles.container}>
      <BackButton/>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "left",
    justifyContent: "center",
    backgroundColor: "white",
    height: '12%', // Ajusta la altura según sea necesario
    elevation: 8, // Sombra para resaltar la barra superior
    paddingLeft: 20, 
  },
});

export default TopBackButton;