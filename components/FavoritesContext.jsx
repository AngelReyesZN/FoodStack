// FavoritosContext.js
import React, { createContext, useContext, useState } from 'react';

const FavoritosContext = createContext();

export const useFavoritos = () => {
  return useContext(FavoritosContext);
};

export const FavoritosProvider = ({ children }) => {
  const [favoritos, setFavoritos] = useState([]);

  const agregarAFavoritos = (producto) => {
    if (!favoritos.find((item) => item.id === producto.id)) {
      setFavoritos([...favoritos, producto]);
    }
  };

  const eliminarDeFavoritos = (id) => {
    setFavoritos(favoritos.filter((item) => item.id !== id));
  };

  const toggleFavorito = (producto) => {
    const isFavorite = favoritos.find((item) => item.id === producto.id);
    if (isFavorite) {
      eliminarDeFavoritos(producto.id);
    } else {
      agregarAFavoritos(producto);
    }
  };

  return (
    <FavoritosContext.Provider value={{ favoritos, agregarAFavoritos, eliminarDeFavoritos, toggleFavorito }}>
      {children}
    </FavoritosContext.Provider>
  );
};