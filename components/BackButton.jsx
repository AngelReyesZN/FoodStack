import React from 'react';
import { TouchableOpacity, Image, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/FontAwesome';

const BackButton = () => {
  const navigation = useNavigation();

  return (
    <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
      <Icon name="chevron-left" size={24} color="#FF6347" />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  backButton: {
    zIndex: 10,
    padding: 10,
    paddingLeft: 0,
  },
  icon: {
    width: 30,
    height: 30,
  },
});

export default BackButton;