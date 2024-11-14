import React from 'react';
import { Text, StyleSheet } from 'react-native';

const CustomText2 = ({ children, style, variant = 'body', ...props }) => {
  return (
    <Text style={[styles[variant], style]} {...props}>
      {children}
    </Text>
  );
};


const styles = StyleSheet.create({
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: 'black',
    fontFamily: 'Montserrat-Bold',
  },
  subtitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'black',
    fontFamily: 'Montserrat-Bold',
  },
  body: {
    fontSize: 16,
    color: '#333',
    fontFamily: 'Montserrat-Regular',
  },
  caption: {
    fontSize: 16,
    color: '#A0A0A0',
    fontFamily: 'Montserrat-Regular',
  },
  loading: {
    fontSize: 18,
    textAlign: 'center',
    color: '#666',
    fontFamily: 'Montserrat-Regular',
  },
});

export default CustomText2;