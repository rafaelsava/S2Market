import { CartProvider } from '@/context/CartContext';
import { FavoritesProvider } from '@/context/FavoritesContext';
import { MyOrdersProvider } from '@/context/MyOrderContext';
import { Slot } from 'expo-router';
import React from 'react';
import { AuthProvider } from '../context/AuthContext';
import { CurrencyProvider } from '../context/CurrencyContext';
import { ProductProvider } from '../context/ProductContext';

export default function RootLayout() {
  return (
        <AuthProvider>
          <MyOrdersProvider>
<FavoritesProvider>
    <CartProvider>
      <CurrencyProvider>
        <ProductProvider>
          <Slot />
        </ProductProvider>
      </CurrencyProvider>
    </CartProvider>
    </FavoritesProvider>
          </MyOrdersProvider>

        </AuthProvider>

  );
}