import React from 'react';
import { View, StyleSheet, TouchableOpacity, Image, Text } from 'react-native';

const BottomMenuBar = () => {
  return (
    <View style={styles.container}>
        {/* Botón de más en el centro arriba */}
        <TouchableOpacity style={styles.addButtonContainer}>
        <View style={styles.addButton}>
            {/* Círculo azul */}
            <View style={styles.plusButtonCircle}>
            {/* Cruz blanca */}
            <Text style={styles.plusButtonCross}>+</Text>
            </View>
        </View>
        </TouchableOpacity>
        {/* Espacio para los 4 iconos de la barra de menú */}
        <View style={styles.menuIconsContainer}>
            {/* Icono 1 */}
            <TouchableOpacity style={styles.iconContainer}>
            <Image source={require('../assets/icono1.png')} style={styles.iconImage} />
            </TouchableOpacity>
            {/* Icono 2 */}
            <TouchableOpacity style={[styles.iconContainer, { paddingRight: 40 }]}>
            <Image source={require('../assets/icono2.png')} style={styles.iconImage} />
            </TouchableOpacity>
            {/* Icono 3 */}
            <TouchableOpacity style={[styles.iconContainer, { paddingLeft: 40 }]}>
            <Image source={require('../assets/icono3.png')} style={styles.iconImage} />
            </TouchableOpacity>
            {/* Icono 4 */}
            <TouchableOpacity style={styles.iconContainer}>
            <Image source={require('../assets/icono4.png')} style={styles.iconImage} />
            </TouchableOpacity>
        </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    elevation: 10,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  menuIconsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flex: 1,
  },
  iconContainer: {
    padding: 10,
  },
  iconImage: {
    width: 19,
    height: 19,
  },
  addButtonContainer: {
    position: 'absolute',
    bottom: 0,
    width: '110%',
    justifyContent: 'center', // Alinea el botón verticalmente en el centro
    alignItems: 'center', // Alinea el botón horizontalmente en el centro
    paddingBottom: 30, // Ajusta la posición vertical según sea necesario
  },
  addButton: {
    width: 40,
    height: 40,
    backgroundColor: 'blue',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  plusButtonCircle: {
    width: 50,
    height: 50,
    borderRadius: 35,
    backgroundColor: '#030A8C',
    justifyContent: 'center',
    alignItems: 'center',
  },
  plusButtonCross: {
    fontWeight: 'bold',
    fontSize: 30, // Tamaño de la cruz
    color: 'white', // Color blanco
  },
});

export default BottomMenuBar;
