import React from 'react';
import { Text } from 'react-native';

const CustomText = ({ style, fontWeight = 'Regular', children, ...props }) => {
  // Definir las variantes de la fuente Montserrat
  const fontFamilies = {
    Regular: 'Montserrat-Regular',
    Medium: 'Montserrat-Medium',
    SemiBold: 'Montserrat-SemiBold',
    Bold: 'Montserrat-Bold',
  };

  return (
    <Text style={[{ fontFamily: fontFamilies[fontWeight] }, style]} {...props}>
      {children}
    </Text>
  );
};

export default CustomText;