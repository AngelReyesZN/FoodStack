import React from 'react';
import { View, StyleSheet } from 'react-native';

import TopBar from '../components/TopBar';
import BottomMenuBar from '../components/BottomMenuBar';

const PurchaseScreen = () => {
  return (
    <View style={styles.container}>
      <TopBar />
      {/* Contenido de la pantalla de menú */}
      {/* Por ejemplo, aquí puedes poner tu lista de opciones de menú */}


      <BottomMenuBar isMenuScreen={true}/>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between', 
  },
});

export default PurchaseScreen;
