import { AuthProvider } from "@/context/AuthContext";
import { CurrencyProvider } from "@/context/CurrencyContext";
import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <AuthProvider>
          <CurrencyProvider>

      <Stack screenOptions={{ headerShown: false }} />
                </CurrencyProvider>

    </AuthProvider>
  );
}
