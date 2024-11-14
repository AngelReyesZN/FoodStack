import React from 'react';
import { View, Text, TextInput, FlatList, Image, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator, TransitionPresets } from '@react-navigation/stack';

import LoginScreen from '../screens/LoginScreen';
import LoadScreen from '../screens/LoadScreen';
import RegisScreen from '../screens/RegisScreen';
import HomeScreen from '../screens/HomeScreen';
import MenuScreen from '../screens/MenuScreen';
import ChatScreen from '../screens/ChatScreen';
import SearchScreen from '../screens/SearchScreen';
import AddProductsScreen from '../screens/addProductsScreen.jsx';
import ProductScreen from '../screens/ProductScreen.jsx';
import SuccessfulScreen from '../screens/SuccessfulScreen';
import PersonalDataScreen from '../screens/PersonalDataScreen';
import FavoritesScreen from '../screens/FavoritesScreen';
import LoadProductScreen from '../screens/LoadProductScreen';
import InfoSellerScreen from '../screens/InfoSellerScreen.jsx';
import HistoryScreen from '../screens/HistoryScreen.jsx';
import MyReviewsScreen from '../screens/MyReviewsScreen.jsx';
import CardsScreen from '../screens/CardsScreen.jsx';
import NotificationsScreen from '../screens/NotificationsScreen.jsx';
import MyProductsScreen from '../screens/MyProductsScreen.jsx';
import EditProductScreen from '../screens/EditProductScreen.jsx';
import SelfInfoScreen from '../screens/SelfInfoScreen';
import OrderScreen from '../screens/OrderScreen.jsx';
import LoadOrderScreen from '../screens/LoadOrderScreen.jsx';
import SuccessfulRegistration from '../screens/SuccessfulRegistrationScreen.jsx';
import WelcomeScreen from '../screens/WelcomeScreen.jsx';

// Importa tu logo aquí
import LogoImage from '../assets/Logo.png';

const Stack = createStackNavigator();

function MyScreens() {
  return (
    <Stack.Navigator
      initialRouteName="Load"
      screenOptions={{
        ...TransitionPresets.SlideFromRightIOS, // Cambia a la animación deseada
        gestureEnabled: true, // Permite gestos para volver atrás
      }}
    >
      <Stack.Screen
        name="Load"
        component={LoadScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Welcome"
        component={WelcomeScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name='Regis'
        component={RegisScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name='Success'
        component={SuccessfulRegistration}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="successful"
        component={SuccessfulScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ProductScreen"
        component={ProductScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="InfoSeller"
        component={InfoSellerScreen}
        options={{ headerShown: false }}
      />

      <Stack.Screen
        name="Order"
        component={OrderScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="LoadOrder"
        component={LoadOrderScreen}
        options={{ headerShown: false }}
      />

      {/* Navegacion del BottomMenuBar */}
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Search"
        component={SearchScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Chats"
        component={ChatScreen}
        options={{ headerShown: false }}

      />
      <Stack.Screen
        name="Menu"
        component={MenuScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="AddProduct"
        component={AddProductsScreen}
        options={{ headerShown: false }}
      />


      {/* Navegacion del MenuScreen */}
      <Stack.Screen
        name="SelfInfoScreen"
        component={SelfInfoScreen}
        options={{ headerShown: false }}
      />

      <Stack.Screen
        name="PersonalInfo"
        component={PersonalDataScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Favorites"
        component={FavoritesScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="History"
        component={HistoryScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="MyReviews"
        component={MyReviewsScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Cards"
        component={CardsScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="MyProducts"
        component={MyProductsScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{ headerShown: false }}
      />

      {/*Navegacion HistoryScreen */}

      {/**Otras pantallas*/}
      <Stack.Screen
        name="LoadProduct"
        component={LoadProductScreen}
        options={{ headerShown: false }}
      />

      {/** Navegacion MisProductos */}
      <Stack.Screen
        name="EditProduct"
        component={EditProductScreen}
        options={{ headerShown: false }}
      />

    </Stack.Navigator>
  );
}

export default function Navigation() {
  return (
    <NavigationContainer>
      <MyScreens />
    </NavigationContainer>
  );
}