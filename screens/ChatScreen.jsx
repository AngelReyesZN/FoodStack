import React from 'react';
import { View, StyleSheet, Text, Image, ScrollView } from 'react-native';

import TopBar from '../components/TopBar';
import BottomMenuBar from '../components/BottomMenuBar';

const ChatScreen = () => {
  return (
    <View style={styles.container}>
      <TopBar />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.announcementContainer}>
          <Text style={styles.announcementTitle}>¡Próximamente en ChangarritoFIF!</Text>
          <Image 
            source={require('../assets/Logo.png')} 
            style={styles.announcementImage} 
          />
          <Text style={styles.announcementText}>
            Estamos trabajando en una increíble función de chat para que puedas comunicarte 
            directamente con los vendedores y otros usuarios. 
            ¡Prepárate para una experiencia de compra aún más interactiva y personalizada!
          </Text>
          <Text style={styles.announcementSubtitle}>
            ¡Mantente atento para futuras actualizaciones y mejoras!
          </Text>
        </View>
      </ScrollView>
      <BottomMenuBar isChatScreen={true} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    backgroundColor: 'white',
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    padding: 20,
  },
  announcementContainer: {
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    padding: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  announcementTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#030A8C',
    marginBottom: 20,
  },
  announcementImage: {
    width: 200,
    height: 200,
    resizeMode: 'contain',
    marginBottom: 20,
  },
  announcementText: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    marginBottom: 20,
  },
  announcementSubtitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#e82d2d',
    textAlign: 'center',
  },
});

export default ChatScreen;
