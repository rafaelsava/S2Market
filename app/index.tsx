import { registerPushTokenLocally } from "@/hooks/notifications";
import { router } from "expo-router";
import { useEffect } from "react";
import { Text, View } from "react-native";

export default function Index() {


  useEffect(() => {
    (async () => {
      try {
        await registerPushTokenLocally();
        console.log("Token registrado localmente");
      } catch (e) {
        console.warn("Error registrando token:", e);
      } finally {
        router.push("/auth");
      }
    })();
  }, []);


  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text>Edit app/index.tsx to edit this screen.</Text>
    </View>
  );
}
