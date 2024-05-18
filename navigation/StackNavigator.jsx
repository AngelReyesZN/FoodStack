import React from 'react';
import { View, Text, TextInput, FlatList, Image, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import LoginScreen from '../screens/LoginScreen';
import StackScreen from '../screens/StackScreen';
import LoadScreen from '../screens/LoadScreen';
import RegisScreen from '../screens/RegisScreen';
import VerifyScreen from '../screens/VerifyScreen';
import HomeScreen from '../screens/HomeScreen';
import MenuScreen from '../screens/MenuScreen';
import ChatScreen from '../screens/ChatScreen';
import SearchScreen from '../screens/SearchScreen';
import AddProductsScreen from '../screens/addProductsScreen.jsx';
import ProductScreen from '../screens/ProductScreen.jsx';
import SuccessfulScreen from '../screens/SuccessfulScreen';

// Importa tu logo aquí
import LogoImage from '../assets/Logo.png';
import SuccessfulScreen from '../screens/SuccessfulScreen';

const Stack = createStackNavigator();

function MyScreens() {
  return (
    <Stack.Navigator initialRouteName="Load">
      <Stack.Screen
        name="Load"
        component={LoadScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{ headerShown: false }}
        
      />


      <Stack.Screen
        name='Regis'
        component={RegisScreen}
        options={({ navigation }) => ({
          headerTitle: () => (
            <View style={{ flexDirection: 'row', alignContent: 'center', alignItems: 'center' }}>
              <Image
                source={LogoImage}
                style={{ width: 35, height: 35, marginRight:5, marginStart: 30 }}
              />
              <Text style={{ color: '#030A8C', fontSize: 18, textAlign: 'center',fontWeight: 'bold', alignItems: 'center'}}>Changarrito FIF</Text>
            </View>
          ),
          headerStyle: {
            backgroundColor: 'white',
          },
          headerTintColor: '#030A8C',
        })}
      />
      <Stack.Screen
        name='Verify'
        component={VerifyScreen}
        options={({ navigation }) => ({
          headerTitle: () => (
            <View style={{ flexDirection: 'row', alignContent: 'center', alignItems: 'center' }}>
              <Image
                source={LogoImage}
                style={{ width: 35, height: 35, marginRight:5, marginStart: 30 }}
              />
              <Text style={{ color: '#030A8C', fontSize: 18, textAlign: 'center',fontWeight: 'bold', alignItems: 'center'}}>Changarrito FIF</Text>
            </View>
          ),
          headerStyle: {
            backgroundColor: 'white',
          },
          headerTintColor: '#030A8C',
        })}
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
      />
      <Stack.Screen
        name="Menu"
        component={MenuScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="AddProduct"
        component={AddProductsScreen}
        //options={{ headerShown: false }}
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
