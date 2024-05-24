import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, initializeAuth, getReactNativePersistence } from "firebase/auth"; // Importa initializeAuth y getReactNativePersistence
import AsyncStorage from '@react-native-async-storage/async-storage'; // Importa AsyncStorage

const firebaseConfig = {
  apiKey: "AIzaSyArP0Z4e78-SeaJ5HdNGJfKArppF2E8Clw",
  authDomain: "changarrofif.firebaseapp.com",
  databaseURL: "https://changarrofif-default-rtdb.firebaseio.com",
  projectId: "changarrofif",
  storageBucket: "changarrofif.appspot.com",
  messagingSenderId: "950941095368",
  appId: "1:950941095368:web:be89324d477d9ccb639cfd",
  measurementId: "G-KKPRC0LGVS"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
const db = getFirestore(app);

// Initialize Firebase Auth with AsyncStorage
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

export { db, auth };
