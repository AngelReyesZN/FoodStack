import React from 'react';
import Navigation from './navigation/StackNavigator.jsx';

//Proveemos de contexto a la aplicacion

import { UserProvider } from './context/UserContext';
import { ProductProvider } from './context/ProductContext'; // Importa el nuevo contexto
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function App() {
  return (
    <UserProvider>
      <ProductProvider>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <Navigation />
        </GestureHandlerRootView>
      </ProductProvider>
    </UserProvider>
  );
}