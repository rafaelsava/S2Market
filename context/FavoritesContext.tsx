// src/context/FavoritesContext.tsx

import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { Product } from './ProductContext'; // ajusta la ruta si es necesario

interface FavoritesContextType {
  favorites: Product[];
  isFavorite: (id: string) => boolean;
  toggleFavorite: (product: Product) => Promise<void>;
}

export const FavoritesContext = createContext<FavoritesContextType>({
  favorites: [],
  isFavorite: () => false,
  toggleFavorite: async () => {},
});

const STORAGE_KEY = '@myapp:favorites';

export const FavoritesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [favoritesMap, setFavoritesMap] = useState<Record<string, Product>>({});

  // Carga inicial desde AsyncStorage
  useEffect(() => {
    (async () => {
      try {
        const json = await AsyncStorage.getItem(STORAGE_KEY);
        if (json) setFavoritesMap(JSON.parse(json));
      } catch (e) {
        console.warn('Error cargando favoritos:', e);
      }
    })();
  }, []);

  // Persistir cambios en AsyncStorage
  const persistFavorites = async (newMap: Record<string, Product>) => {
    setFavoritesMap(newMap);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newMap));
    } catch (e) {
      console.warn('Error guardando favoritos:', e);
    }
  };

  // Agrega o elimina un favorito
  const toggleFavorite = async (product: Product) => {
    const next = { ...favoritesMap };
    if (next[product.id]) {
      delete next[product.id];
    } else {
      next[product.id] = product;
    }
    await persistFavorites(next);
  };

  const isFavorite = (id: string) => !!favoritesMap[id];

  return (
    <FavoritesContext.Provider value={{ favorites: Object.values(favoritesMap), isFavorite, toggleFavorite }}>
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = () => useContext(FavoritesContext);
