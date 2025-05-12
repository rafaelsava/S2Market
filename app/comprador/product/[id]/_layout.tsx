import { AuthProvider } from "@/context/AuthContext";
import { ProductProvider } from "@/context/ProductContext";
import { Stack } from "expo-router";

export default function ProductDetailsLayout() {
  return (
    <AuthProvider>
        <ProductProvider>
            <Stack screenOptions={{ headerShown: false }} />
        </ProductProvider>
    </AuthProvider>
  );
}
