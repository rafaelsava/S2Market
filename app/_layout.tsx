import { CartProvider } from '@/context/CartContext';
import { FavoritesProvider } from '@/context/FavoritesContext';
import { Slot } from 'expo-router';
import React from 'react';
import { AuthProvider } from '../context/AuthContext';
import { CurrencyProvider } from '../context/CurrencyContext';
import { ProductProvider } from '../context/ProductContext';

export default function RootLayout() {
  return (
        <AuthProvider>
<FavoritesProvider>
    <CartProvider>
      <CurrencyProvider>
        <ProductProvider>
          <Slot />
        </ProductProvider>
      </CurrencyProvider>
    </CartProvider>
    </FavoritesProvider>

        </AuthProvider>

  );
}