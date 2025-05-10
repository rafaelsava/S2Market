import { AuthProvider } from "@/context/AuthContext";
import { ProductProvider } from "@/context/ProductContext";
import { Stack } from "expo-router";

export default function BuyerLayout() {
  return (
    <AuthProvider>
        <ProductProvider>
            <Stack screenOptions={{ headerShown: false }} />
        </ProductProvider>
    </AuthProvider>
  );
}
