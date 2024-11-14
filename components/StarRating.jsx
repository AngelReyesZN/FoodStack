import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

const StarRating = ({ maxStars, rating, onStarPress, size, color}) => {
    return (
        <View style={styles.starContainer}>
            {Array.from({ length: maxStars }, (_, index) => (
                <TouchableOpacity key={index} onPress={() => onStarPress(index + 1)}>
                    <Icon
                        name={index < rating ? 'star' : 'star-o'}
                        size={size}
                        color={color}
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
        paddingRight: 10,
    },
    star: {
        marginHorizontal: 1,
    },
});

export default StarRating;