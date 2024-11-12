import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import MainProductCard from '../components/MainProductCard';
import TopBar from '../components/TopBar';
import BottomMenuBar from '../components/BottomMenuBar';
import BackButton from '../components/BackButton';
import CustomText from '../components/CustomText'; // Importa el componente CustomText
import { useFavoritos } from '../components/FavoritesContext.jsx';

const FavoritesScreen = () => {
  const { favoritos } = useFavoritos();

  const renderHeader = () => (
    <View>
      <View style={styles.headerContainer}>
        <BackButton />
        <CustomText style={styles.title} fontWeight="SemiBold">
          Favoritos
        </CustomText>
      </View>
      <View style={styles.separator} />
    </View>
  );

  return (
    <View style={styles.container}>
      <TopBar />
      {renderHeader()}
      <View style={styles.content}>
        {favoritos.length === 0 ? (
          <Text style={styles.emptyText}>No tienes productos en favoritos</Text>
        ) : (
          <FlatList
            data={favoritos}
            keyExtractor={(item) => item.id.toString()}
            numColumns={2}
            renderItem={({ item }) => (
              <View style={styles.cardContainer}>
                <MainProductCard product={item} />
              </View>
            )}
          />
        )}
      </View>
      <BottomMenuBar />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 15,
  },
  title: {
    fontSize: 24,
    color: '#000',
    textAlign: 'center',
    flex: 1,
  },
  separator: {
    height: 1,
    backgroundColor: '#C1C1C1',
    width: '85%',
    alignSelf: 'center',
    marginTop: 20,
  },
  iconPlaceholder: {
    width: 24, // Asegúrate de que coincida con el tamaño del ícono de notificaciones
    height: 24,
  },
  content: {
    flex: 1,
    paddingHorizontal: 10,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
  },
  cardContainer: {
    flex: 1,
    margin: 5,
  },
});

export default FavoritesScreen;
