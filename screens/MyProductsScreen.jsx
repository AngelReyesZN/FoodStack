import React from 'react';
import { View, StyleSheet, Text } from 'react-native';

import TopBar from '../components/TopBar';
import BottomMenuBar from '../components/BottomMenuBar';
import BackButton from '../components/BackButton';


const MyProductsScreen = () => {
  return (
    <View style={styles.container}>
      <TopBar />
      <View style={styles.headerContainer}>
        <BackButton />
        <Text style={styles.title}>Mis productos</Text>
      </View>

      <BottomMenuBar isMenuScreen={true}/>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  title: {
    fontSize: 22,
        fontWeight: 'bold',
        color: '#030A8C',
        marginLeft: 10,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 10,
  },
});

export default MyProductsScreen;
