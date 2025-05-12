import { Slot } from 'expo-router';
import React from 'react';
import { AuthProvider } from '../context/AuthContext';
import { CurrencyProvider } from '../context/CurrencyContext';
import { ProductProvider } from '../context/ProductContext';

export default function RootLayout() {
  return (
    <AuthProvider>
      <CurrencyProvider>
        <ProductProvider>
          <Slot />
        </ProductProvider>
      </CurrencyProvider>
    </AuthProvider>
  );
}