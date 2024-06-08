import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

const StarRating = ({ maxStars, rating, onStarPress }) => {
    return (
        <View style={styles.starContainer}>
            {Array.from({ length: maxStars }, (_, index) => (
                <TouchableOpacity key={index} onPress={() => onStarPress(index + 1)}>
                    <Icon
                        name={index < rating ? 'star' : 'star-o'}
                        size={35}
                        color="#030A8C"
                        style={styles.star}
                    />
                </TouchableOpacity>
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    starContainer: {
        flexDirection: 'row',
    },
    star: {
        marginHorizontal: 4,
    },
});

export default StarRating;