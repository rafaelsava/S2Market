import { useRouter } from "expo-router";
import React from "react";
import { Image, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function OrderConfirmed() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.back()}
      >
        {/* Aquí un icono flecha o texto */}
        <Text>{"←"}</Text>
      </TouchableOpacity>

      <View style={styles.content}>
        <Image
          source={require("../../images/ordenconfirmada.png")} // O la ruta local de tu imagen
          style={styles.image}
          resizeMode="contain"
        />
        <Text style={styles.title}>Orden Confirmada!</Text>
        <Text style={styles.subtitle}>
          Tu orden ha sido confirmada. En breves te enviaremos un email de confirmación.
        </Text>

        <TouchableOpacity
          style={styles.button}
          onPress={() => router.push("../comprador/misordenes")} // Ruta a las órdenes del comprador
        >
          <Text style={styles.buttonText}>Ir a órdenes</Text>
        </TouchableOpacity>

      </View>
        <TouchableOpacity
          style={[styles.continueButton]}
          onPress={() => router.push("/comprador")}
        >
          <Text style={[styles.buttonText, styles.continueText]}>Continue Shopping</Text>
        </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16,backgroundColor: "#fff" },
  backButton: { marginBottom: 20 },
  content: { flex: 1, justifyContent: "center", alignItems: "center" },
  image: { width: 250, height: 150, marginBottom: 30,marginTop: -50 },
  title: { fontSize: 28, fontWeight: "bold", marginBottom: 10 },
  subtitle: { fontSize: 18, color: "#666", textAlign: "center", marginBottom: 30 },
  button: {
    backgroundColor: "#ddd",
    paddingVertical: 20,
    paddingHorizontal: 35,
    borderRadius: 8,
    marginVertical: 8,
    width: "80%",
    alignItems: "center",
  },
  continueButton: {
    backgroundColor: "#2E4098",
    bottom: 0,
    position: "absolute",
    left: 0,
    right: 0,
    width: "100%",
    height: 75,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    fontWeight: "600",
    fontSize: 16,
    color: "#333",
  },
  continueText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
});
