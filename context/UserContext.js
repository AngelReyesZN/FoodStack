import React, { createContext, useState } from 'react';
import registrosData from '../data/data';

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(registrosData[0]); // Suponiendo que el primer usuario está autenticado
  const [registros, setRegistros] = useState(registrosData);
  const [favorites, setFavorites] = useState([]); // Estado para manejar los productos favoritos

  const updateUser = (id, updatedUser) => {
    setRegistros((prevRegistros) =>
      prevRegistros.map((user) =>
        user.id === id ? { ...user, ...updatedUser } : user
      )
    );
    if (user.id === id) {
      setUser({ ...user, ...updatedUser });
    }
  };

  const addToFavorites = (product) => {
    setFavorites((prevFavorites) => [...prevFavorites, product]);
  };

  const removeFromFavorites = (productId) => {
    setFavorites((prevFavorites) =>
      prevFavorites.filter((item) => item.id !== productId)
    );
  };

  return (
    <UserContext.Provider value={{ user, setUser, registros, updateUser, favorites, addToFavorites, removeFromFavorites }}>
      {children}
    </UserContext.Provider>
  );
};
