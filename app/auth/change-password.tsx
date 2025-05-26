import { AuthContext } from "@/context/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useContext, useState } from "react";
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const ChangePasswordScreen = () => {
  const router = useRouter();
  const { changePassword } = useContext(AuthContext);

  const [currentPassword, setCurrentPassword] = useState("");
  const [secureCurrent, setSecureCurrent] = useState(true);

  const [newPassword, setNewPassword] = useState("");
  const [secureNew, setSecureNew] = useState(true);

  const [confirmPassword, setConfirmPassword] = useState("");
  const [secureConfirm, setSecureConfirm] = useState(true);

  const [loading, setLoading] = useState(false);

  const handleChange = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert("Campos requeridos", "Por favor completa todos los campos.");
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert("Error", "La nueva contraseña y su confirmación no coinciden.");
      return;
    }
    if (newPassword.length < 6) {
      Alert.alert("Error", "La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    setLoading(true);
    try {
      await changePassword(currentPassword, newPassword);
      Alert.alert("¡Éxito!", "Contraseña actualizada correctamente.", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (error: any) {
      console.error(error);
      let message = error.message;
      if (message.includes("wrong-password")) {
        message = "La contraseña actual es incorrecta.";
      } else if (message.includes("requires-recent-login")) {
        message = "Necesitas re-autenticarte. Cierra sesión y vuelve a entrar.";
      }
      Alert.alert("Error", message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={24} color="#000" />
      </TouchableOpacity>

      <Text style={styles.title}>Cambiar contraseña</Text>

      {/* Contraseña actual */}
      <Text style={styles.label}>Contraseña actual</Text>
      <View style={styles.passwordContainer}>
        <TextInput
          style={[styles.input, { flex: 1 }]}
          placeholder="Escribe tu contraseña actual"
          secureTextEntry={secureCurrent}
          value={currentPassword}
          onChangeText={setCurrentPassword}
        />
        <TouchableOpacity onPress={() => setSecureCurrent(!secureCurrent)}>
          <Ionicons
            name={secureCurrent ? "eye-off" : "eye"}
            size={20}
            color="#333"
          />
        </TouchableOpacity>
      </View>

      {/* Nueva contraseña */}
      <Text style={styles.label}>Nueva contraseña</Text>
      <View style={styles.passwordContainer}>
        <TextInput
          style={[styles.input, { flex: 1 }]}
          placeholder="Escribe la nueva contraseña"
          secureTextEntry={secureNew}
          value={newPassword}
          onChangeText={setNewPassword}
        />
        <TouchableOpacity onPress={() => setSecureNew(!secureNew)}>
          <Ionicons
            name={secureNew ? "eye-off" : "eye"}
            size={20}
            color="#333"
          />
        </TouchableOpacity>
      </View>

      {/* Confirmar nueva contraseña */}
      <Text style={styles.label}>Confirmar nueva contraseña</Text>
      <View style={styles.passwordContainer}>
        <TextInput
          style={[styles.input, { flex: 1 }]}
          placeholder="Repite la nueva contraseña"
          secureTextEntry={secureConfirm}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />
        <TouchableOpacity onPress={() => setSecureConfirm(!secureConfirm)}>
          <Ionicons
            name={secureConfirm ? "eye-off" : "eye"}
            size={20}
            color="#333"
          />
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={[styles.registerButton, loading && { opacity: 0.7 }]}
        onPress={handleChange}
        disabled={loading}
      >
        <Text style={styles.registerText}>
          {loading ? "Actualizando..." : "Actualizar contraseña"}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default ChangePasswordScreen;

const styles = StyleSheet.create({
  container: {
    paddingTop: 70,
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
    marginBottom: 160,
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
  registerButton: {
    backgroundColor: "#2E4098",
    paddingVertical: 12,
    borderRadius: 6,
    position: "absolute",
    left: 0,
    bottom: 0,
    right: 0,
    height: 75,
    justifyContent: "center",
    alignItems: "center",
  },
  registerText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 18,
  },
});
