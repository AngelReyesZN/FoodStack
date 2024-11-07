import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';

const CategorySection = ({ categories, currentCategory, filterByCategory }) => {
  return (
    <View style={styles.categoryContainer}>
      <FlatList
        horizontal
        data={categories}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => filterByCategory(item.key)}
            style={styles.iconWrapper}
          >
            <Text
              style={[
                styles.iconText,
                currentCategory === item.key
                  ? styles.selectedCategory
                  : styles.unselectedCategory,
              ]}
            >
              {item.key}
            </Text>
          </TouchableOpacity>
        )}
        keyExtractor={(item) => item.key}
        showsHorizontalScrollIndicator={false}
      />
      <Text style={styles.allProductsText}>
        {currentCategory === 'Todos' ? 'Todos los productos' : currentCategory}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  categoryContainer: {
    marginTop: 10,
    marginBottom: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconWrapper: {
    paddingTop: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  iconText: {
    borderWidth: 1,
    borderColor: '#ccc',
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 5,
    paddingHorizontal: 10,
    marginTop: 5,
    marginBottom: 5,
    fontSize: 12,
    color: '#666',
    fontWeight: 'bold',
  },
  selectedCategory: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    opacity: 1,
  },
  unselectedCategory: {
    opacity: 0.5,
  },
  allProductsText: {
    fontSize: 20,
    marginLeft: 10,
    marginBottom: 5,
    fontWeight: 'bold',
    marginTop: 15,
  },
});

export default CategorySection;
