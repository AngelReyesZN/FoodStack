import React from 'react';
import { View, StyleSheet, Image } from 'react-native';
import BackButton from './BackButton';
import CustomText2 from './CustomText2';

const Header = ({ title, backButton = true, icon }) => {
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
      {icon && (
        <View style={styles.iconContainer}>
          <Image source={icon} style={styles.icon} />
        </View>
      )}
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
    width: '98%',
    alignSelf: 'center', // Centra el contenedor horizontal
    marginVertical: 10,
    marginBottom: 20,
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
  iconContainer: {
    position: 'absolute',
    right: 20,
  },
  icon: {
    width: 30,
    height: 30,
  },
});

export default Header;