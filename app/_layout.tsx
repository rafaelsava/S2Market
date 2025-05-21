import { CartProvider } from '@/context/CartContext';
import { Slot } from 'expo-router';
import React from 'react';
import { AuthProvider } from '../context/AuthContext';
import { CurrencyProvider } from '../context/CurrencyContext';
import { ProductProvider } from '../context/ProductContext';

export default function RootLayout() {
  return (
    <CartProvider>
    <AuthProvider>
      <CurrencyProvider>
        <ProductProvider>
          <Slot />
        </ProductProvider>
      </CurrencyProvider>
    </AuthProvider>
    </CartProvider>
  );
}