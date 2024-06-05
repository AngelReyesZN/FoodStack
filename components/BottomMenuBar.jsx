import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useNavigation, useIsFocused } from '@react-navigation/native';

const BottomMenuBar = ({ isMenuScreen, isChatScreen, isHomeScreen }) => {
  const navigation = useNavigation();
  const isFocused = useIsFocused();

  const [menuIcon, setMenuIcon] = useState(require('../assets/iconsButtonBar/menuIcon.png'));

  useEffect(() => {
    if (isMenuScreen && isFocused) {
      setMenuIcon(require('../assets/iconsButtonBar/menuIconBlue.png'));
    } else {
      setMenuIcon(require('../assets/iconsButtonBar/menuIcon.png'));
    }
  }, [isMenuScreen, isFocused]);

  const [homeIcon, setHomeIcon] = useState(require('../assets/iconsButtonBar/home.png'));

  useEffect(() => {
    if (isHomeScreen && isFocused) {
      setHomeIcon(require('../assets/iconsButtonBar/home2.png'));
    } else {
      setHomeIcon(require('../assets/iconsButtonBar/home.png'));
    }
  }, [isHomeScreen, isFocused]);

  const [chatIcon, setChatIcon] = useState(require('../assets/iconsButtonBar/comentarios2.png'));

  useEffect(() => {
    if (isChatScreen && isFocused) {
      setChatIcon(require('../assets/iconsButtonBar/comentarios.png'));
    } else {
      setChatIcon(require('../assets/iconsButtonBar/comentarios2.png'));
    }
  }, [isChatScreen, isFocused]);

  const navigateToScreen = (screenName) => {
    navigation.navigate(screenName);
  };

  return (
    <View style={styles.container}>
      <View style={styles.containerAddButton}>
        <TouchableOpacity style={styles.iconContainer} onPress={() => navigateToScreen('AddProduct')}>
          <Image source={require('../assets/iconsButtonBar/addbutton2.png')} style={styles.addButton} />
        </TouchableOpacity>
      </View>
      <View style={styles.menuIconsContainer}>
        <TouchableOpacity style={styles.iconContainer} onPress={() => navigateToScreen('Home')}>
          <Image source={homeIcon} style={styles.iconImage} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconContainerSearch} onPress={() => navigateToScreen('Search')}>
          <Image source={require('../assets/iconsButtonBar/busqueda2.png')} style={styles.iconImage} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconContainer} onPress={() => navigateToScreen('Chats')}>
          <Image source={chatIcon} style={styles.iconImage} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconContainer} onPress={() => navigateToScreen('Menu')}>
          <Image source={menuIcon} style={styles.iconImage} />
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
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    elevation: 10,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  menuIconsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    padding: 10,
  },
  iconContainerSearch: {
    paddingRight: 80,
  },
  iconImage: {
    width: 19,
    height: 19,
  },
  addButton: {
    width: 70,
    height: 70,
  },
  containerAddButton: {
    position: 'absolute',
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 45,
    elevation: 10,
  },
});

export default BottomMenuBar;
