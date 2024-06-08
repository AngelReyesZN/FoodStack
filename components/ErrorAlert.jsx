import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';

const CustomAlert = ({ message, onClose, duration = 1800 }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);

    return () => clearTimeout(timer);
  }, [onClose, duration]);

  return (
    <View style={styles.alertContainer}>
      <View style={styles.iconContainer}>
        <Image source={require('../assets/rscMenu/error.png')} style={styles.icon} />
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.title}>Error</Text>
        <Text style={styles.message}>{message}</Text>
      </View>
      <TouchableOpacity onPress={onClose} style={styles.closeButton}>
        <Text style={styles.closeButtonText}>✕</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  alertContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ae7070',
    borderRadius: 25,
    padding: 15,
    margin: 8,
  },
  iconContainer: {
    marginRight: 10,
  },
  icon: {
    width: 24,
    height: 24,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    color: 'white',
    fontWeight: 'bold',
    marginBottom: 2,
  },
  message: {
    color: 'white',
  },
  closeButton: {
    marginLeft: 10,
  },
  closeButtonText: {
    color: 'white',
    fontSize: 16,
  },
});

export default CustomAlert;