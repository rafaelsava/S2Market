import { AuthContext } from "@/context/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useContext, useState } from "react";
import {
  Alert,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";

const LoginScreen = () => {
  const router = useRouter();
  const { login } = useContext(AuthContext);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [secure, setSecure] = useState(true);
  const [rememberMe, setRememberMe] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Campos requeridos", "Por favor completa todos los campos.");
      return;
    }

    const role = await login(email, password);
    if (role) {
      router.replace(`../${role}/`); // Ruta a la home
    } else {
      Alert.alert("Error", "Correo o contraseña incorrectos.");
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={24} color="#000" />
      </TouchableOpacity>

      <Text style={styles.title}>Bienvenidos</Text>
      <Text style={styles.subtitle}>Ingresa tus datos para continuar</Text>

      <Text style={styles.label}>Email</Text>
      <TextInput
        style={styles.input}
        placeholder="Correo electrónico"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />

      <Text style={styles.label}>Contraseña</Text>
      <View style={styles.passwordContainer}>
        <TextInput
          style={[styles.input, { flex: 1 }]}
          placeholder="Contraseña"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={secure}
        />
        <TouchableOpacity onPress={() => setSecure(!secure)}>
          <Ionicons name={secure ? "eye-off" : "eye"} size={20} color="#333" />
        </TouchableOpacity>
      </View>

      <TouchableOpacity>
        <Text style={styles.forgotText}>¿Olvidaste tu contraseña?</Text>
      </TouchableOpacity>

      <View style={styles.rememberContainer}>
        <Text style={styles.rememberText}>Recuérdame</Text>
        <Switch value={rememberMe} onValueChange={setRememberMe} />
      </View>

      <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
        <Text style={styles.loginText}>Login</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push("/auth/register")}>
        <Text style={styles.registerText}>
          ¿Aún no tienes cuenta?{" "}
          <Text style={{ color: "#4B55E1" }}>Regístrate</Text>
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default LoginScreen;
const styles = StyleSheet.create({
    container: {
      paddingTop: 60,
      flex: 1,
      padding: 24,
      backgroundColor: "#fff",
    },
    backButton: {
      marginBottom: 20,
    },
    title: {
      fontSize: 28,
      fontWeight: "bold",
      marginBottom: 4,
      textAlign: "center",
    },
    subtitle: {
      color: "#999",
      marginBottom: 24,
      textAlign: "center",
  
    },
    label: {
      fontWeight: "600",
      marginBottom: 6,
    },
    input: {
      borderBottomWidth: 1,
      borderBottomColor: "#ccc",
      paddingVertical: 8,
      marginBottom: 16,
    },
    passwordContainer: {
      flexDirection: "row",
      alignItems: "center",
    },
    forgotText: {
      alignSelf: "flex-end",
      color: "red",
      marginBottom: 16,
    },
    rememberContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 24,
    },
    rememberText: {
      fontSize: 14,
    },
    loginButton: {
      backgroundColor: "#2E4098",
      paddingVertical: 12,
      borderRadius: 6,
      alignItems: "center",
      marginBottom: 20,
    },
    loginText: {
      color: "#fff",
      fontWeight: "600",
      fontSize: 16,
    },
    registerText: {
      textAlign: "center",
      fontSize: 14,
      color: "#555",
    },
  }); 