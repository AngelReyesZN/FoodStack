import React, { useEffect, useState } from 'react';
import { View, TouchableOpacity, Image, StyleSheet, Text, Linking } from 'react-native';

const AdSection = ({ advertisements }) => {
  const [currentAdIndex, setCurrentAdIndex] = useState(0);

  const nextAd = () => {
    setCurrentAdIndex((prevIndex) => (prevIndex + 1) % advertisements.length);
  };

  useEffect(() => {
    const intervalId = setInterval(nextAd, 5000);
    return () => clearInterval(intervalId);
  }, []);

  const handleLinkPress = () => {
    Linking.openURL('https://www.facebook.com/fifuaq');
  };

  return (
    <>
      <TouchableOpacity onPress={nextAd} style={styles.adContainer}>
        <Image
          source={advertisements[currentAdIndex]}
          style={styles.adImage}
        />
      </TouchableOpacity>
      <View style={styles.linkContainer}>
        <Text style={styles.linkText}>
          Ve todos los anuncios{' '}
          <Text style={styles.linkHighlight} onPress={handleLinkPress}>
            aquí
          </Text>
        </Text>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  adContainer: {
    paddingTop: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  adImage: {
    width: 350,
    height: 180,
    resizeMode: 'cover',
    borderRadius: 20,
  },
  linkContainer: {
    width: '100%',
    paddingHorizontal: 20,
  },
  linkText: {
    textAlign: 'right',
    marginTop: 4,
    fontSize: 14,
  },
  linkHighlight: {
    color: '#FF6347',
    textDecorationLine: 'underline',
  },
});

export default AdSection;
