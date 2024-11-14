import React from 'react';
import { View, StyleSheet } from 'react-native';
import BackButton from './BackButton';
import CustomText2 from './CustomText2';

const Header = ({ title, backButton = true }) => {
  return (
    <View style={styles.headerContainer}>
      {backButton && (
        <View style={styles.backButtonContainer}>
          <BackButton />
        </View>
      )}
      <View style={[styles.titleContainer, !backButton && styles.titleContainerCentered]}>
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
  titleContainerCentered: {
    flex: 1, // Ocupa todo el espacio disponible si no hay botón de regreso
  },
});

export default Header;