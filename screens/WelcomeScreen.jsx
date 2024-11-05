import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Image, Dimensions, StatusBar } from 'react-native';
import { useNavigation } from '@react-navigation/native'; // Importar el hook
import CustomText from '../components/CustomText';

const WelcomeScreen = () => {
    const navigation = useNavigation(); // Usar el hook para obtener 'navigation'

    return (
        <View style={styles.container}>
            <StatusBar
                barStyle="light-content"
                backgroundColor="#FF6347"
                translucent={false}
            />
            <View style={styles.logoContainer}>
                <Image source={require('../assets/FoodStackLogo.png')} style={styles.logo} />
            </View>
            <View style={styles.contentContainer}>
                <CustomText style={styles.title} fontWeight='Bold'>¡Bienvenido!</CustomText>
                <Image source={require('../assets/welcomeImage.png')} style={styles.welcomeImage} />
                <TouchableOpacity style={styles.signupButton} onPress={() => navigation.replace('Regis')}>
                    <CustomText style={styles.signupButtonlabel} fontWeight="Bold">Registrarse</CustomText>
                </TouchableOpacity>
                <TouchableOpacity style={styles.loginButton} onPress={() => navigation.replace('Login')}>
                    <CustomText style={styles.loginButtonlabel} fontWeight="Medium">Iniciar sesión</CustomText>
                </TouchableOpacity>
            </View>

        </View>

    )
};
const { width, height } = Dimensions.get('window');
const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FF6347',
    },
    logoContainer: {
        backgroundColor: '#FF6347',
        width: '100%',
        height: height * 0.25, // Responsivo en función del alto de la pantalla
        padding: 15,
        paddingTop: height * 0.05, // Espaciado dinámico basado en el alto
        alignItems: 'center',
        justifyContent: 'center',
    },
    logo: {
        width: width * 0.3,  // Logotipo que se ajusta al ancho de la pantalla
        height: width * 0.3,
    },
    title: {
        fontSize: 36,
        marginBottom: height * 0.06,
    },
    welcomeImage: {
        width: width * 0.5, // Imagen de bienvenida que se ajusta al ancho de la pantalla
        height: height * 0.25, // Imagen de bienvenida que se ajusta al alto de la pantalla
        marginBottom: height * 0.04,

    },
    contentContainer: {
        flex: 1,
        backgroundColor: '#fff',
        borderTopLeftRadius: 35,
        borderTopRightRadius: 35,
        alignItems: 'center',
        paddingTop: height * 0.02, // Padding dinámico
        width: '100%',
        justifyContent: 'center',
    },
    signupButton: {
        marginTop: height * 0.015,
        marginBottom: height * 0.02,
        backgroundColor: '#FF6347',
        padding: height * 0.015,
        borderRadius: 10,
        width: '80%',
        alignSelf: 'center',
        borderWidth: 2,
        borderColor: '#CBCBCB',
    },
    signupButtonlabel: {
        color: '#fff',
        textAlign: 'center',
        fontSize: 20,
    },
    loginButton: {
        marginTop: height * 0.015,
        marginBottom: height * 0.02,
        backgroundColor: '#FFFFFF',
        padding: height * 0.015,
        borderRadius: 10,
        width: '80%',
        alignSelf: 'center',
        borderWidth: 2,
        borderColor: '#FF6347',
    },
    loginButtonlabel: {
        color: '#000',
        textAlign: 'center',
        fontSize: 20,
    },
});
export default WelcomeScreen;
