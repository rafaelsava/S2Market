// utils/notifications.ts
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

const TOKEN_KEY = "expoPushToken";

export async function registerPushTokenLocally() {
  if (!Device.isDevice) throw new Error("Debes usar un dispositivo físico");

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
    });
  }

  const { status: existing } = await Notifications.getPermissionsAsync();
  let finalStatus = existing;
  if (existing !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  if (finalStatus !== "granted") {
    console.warn("Permisos de notificación denegados");
    return;
  }

  const projectId =
    Constants.expoConfig?.extra?.eas?.projectId ||
    Constants.easConfig?.projectId!;
  const { data: token } = await Notifications.getExpoPushTokenAsync({ projectId });

  // Guarda en AsyncStorage
  await AsyncStorage.setItem(TOKEN_KEY, token);
  console.log("✅ Token guardado localmente:", token);
}

export async function getStoredPushToken() {
  return await AsyncStorage.getItem(TOKEN_KEY);
}
