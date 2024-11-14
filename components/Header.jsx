import React from 'react';
import { View, StyleSheet } from 'react-native';
import BackButton from './BackButton';
import CustomText2 from './CustomText2';
const Header = ({ title }) => {
  return (
    <View style={styles.headerContainer}>
      <View style={styles.backButtonContainer}>
        <BackButton />
      </View>
      <View style={styles.titleContainer}>
        <CustomText2 variant='title'>{title}</CustomText2>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between', // Distribuye los elementos horizontalmente con espacio entre ellos
    paddingHorizontal: 20,
    marginTop: 20,
    width: '90%',
    alignSelf: 'center', // Centra el contenedor horizontal
    marginVertical: 10,
    marginBottom: 30,
  },
  backButtonContainer: {
    position: 'absolute',
    left: 20,
  },
  titleContainer: {
    flex: 3,
    alignItems: 'center', // Centra el título horizontalmente
  },
});

export default Header;