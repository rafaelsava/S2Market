// app/index.tsx
import { router } from "expo-router";
import { useEffect } from "react";
import { Image, StyleSheet, View } from "react-native";

export default function Index() {
  useEffect(() => {
    const timeout = setTimeout(() => {
      router.push("/auth");
    }, 2000);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <View style={styles.container}>
      {/* Reemplaza el View por <Image source={require('...')} /> */}
      <View style={styles.logoPlaceholder}>
      <Image
        source={require('../images/logos2market.png')}
        style={styles.logoPlaceholder}
      />

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#041968",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  logoPlaceholder: {
    width: 200,
    height: 250,
    backgroundColor: "#041968", // color de placeholder
  },
  title: {
    color: "#fff",
    fontSize: 32,
    fontWeight: "bold",
  },
});
