// services/firestore.js
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../services/firebaseConfig';

export const getDocuments = async (collectionName) => {
  const querySnapshot = await getDocs(collection(db, collectionName));
  const documents = [];
  querySnapshot.forEach((doc) => {
    documents.push({ id: doc.id, ...doc.data() });
  });
  return documents;
};
