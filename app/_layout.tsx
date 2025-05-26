import { CartProvider } from '@/context/CartContext';
import { FavoritesProvider } from '@/context/FavoritesContext';
import { MyOrdersProvider } from '@/context/MyOrderContext';
import * as Notifications from "expo-notifications";
import { Slot } from 'expo-router';
import React, { useEffect } from 'react';
import { Platform } from 'react-native';
import { AuthProvider } from '../context/AuthContext';
import { CurrencyProvider } from '../context/CurrencyContext';
import { ProductProvider } from '../context/ProductContext';


// Handler global para notificaciones
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export default function RootLayout() {
  useEffect(() => {
    (async () => {
      const { status: existing } = await Notifications.getPermissionsAsync();
      let finalStatus = existing;
      if (existing !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== "granted") {
        console.warn("🚨 Permisos de notificación denegados");
        return;
      }
      if (Platform.OS === "android") {
        await Notifications.setNotificationChannelAsync("default", {
          name: "default",
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
        });
      }
    })();
  }, []);

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