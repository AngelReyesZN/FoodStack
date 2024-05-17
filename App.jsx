import React from 'react';
import Navigation from './navigation/StackNavigator.jsx';

//Proveemos de contexto a la aplicacion

import { UserProvider } from './context/UserContext';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function App() {
  return (
    <UserProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <Navigation />
      </GestureHandlerRootView>
    </UserProvider>
  );
}
