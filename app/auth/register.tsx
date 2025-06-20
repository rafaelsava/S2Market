import CameraModal from "@/components/CameraModal";
import { AuthContext } from "@/context/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useContext, useState } from "react";
import {
  Alert,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const RegisterScreen = () => {
  const router = useRouter();
  const { register } = useContext(AuthContext);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [secure, setSecure] = useState(true);
  const [role, setRole] = useState<"comprador" | "vendedor">("comprador");

  const [photoURL, setPhotoURL] = useState<string | undefined>();
  const [cameraVisible, setCameraVisible] = useState(false);

  const handleRegister = async () => {
    if (!name || !email || !password) {
      Alert.alert("Campos requeridos", "Por favor completa todos los campos.");
      return;
    }

    const success = await register({
      name,
      email,
      password,
      role,
      photoURL,          // pasamos la URL
    });

    if (success) {
      router.replace("/auth"); // Ajusta si tienes tabs u otra navegación
    } else {
      Alert.alert("Error", "No se pudo registrar el usuario.");
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={24} color="#000" />
      </TouchableOpacity>

      <Text style={styles.title}>Regístrate</Text>

       {/* --- FOTO DE PERFIL --- */}
      <View style={styles.photoSection}>
        {photoURL ? (
          <Image source={{ uri: photoURL }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Ionicons name="person" size={48} color="#aaa" />
          </View>
        )}
        <TouchableOpacity
          style={styles.photoButton}
          onPress={() => setCameraVisible(true)}
        >
          <Text style={styles.photoButtonText}>
            {photoURL ? "Cambiar foto" : "Tomar foto"}
          </Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.label}>Usuario</Text>
      <TextInput
        style={styles.input}
        placeholder="Nombre completo"
        value={name}
        onChangeText={setName}
      />

      
      <Text style={styles.label}>Email</Text>
      <TextInput
        style={styles.input}
        placeholder="Correo electrónico"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
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


      <View style={styles.roleContainer}>
        <TouchableOpacity
          style={[
            styles.roleButton,
            role === "vendedor" ? styles.roleSelected : styles.roleUnselected,
          ]}
          onPress={() => setRole("vendedor")}
        >
          <Text
            style={
              role === "vendedor"
                ? styles.roleSelectedText
                : styles.roleUnselectedText
            }
          >
            Vendedor
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.roleButton,
            role === "comprador" ? styles.roleSelected : styles.roleUnselected,
          ]}
          onPress={() => setRole("comprador")}
        >
          <Text
            style={
              role === "comprador"
                ? styles.roleSelectedText
                : styles.roleUnselectedText
            }
          >
            Comprador
          </Text>
        </TouchableOpacity>
      </View>




      {/* --- CAMERA MODAL --- */}
      <CameraModal
        isVisible={cameraVisible}
        onClose={() => setCameraVisible(false)}
        onCapture={(url) => setPhotoURL(url)}
      />

            <TouchableOpacity style={styles.registerButton} onPress={handleRegister}>
        <Text style={styles.registerText}>Registrarse</Text>
      </TouchableOpacity>
    </View>
  );
};

export default RegisterScreen;

// Estilos (sin cambios)
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
  roleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 32,
  },
  roleButton: {
    flex: 1,
    paddingVertical: 10,
    marginHorizontal: 5,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  roleSelected: {
    backgroundColor: "#66bb6a",
  },
  roleUnselected: {
    backgroundColor: "#f0f0f0",
  },
  roleSelectedText: {
    color: "#fff",
    fontWeight: "600",
  },
  roleUnselectedText: {
    color: "#999",
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
  photoSection: {
    alignItems: "center",
    marginBottom: 24,
  },
  avatar: {
    width: 100, height: 100, borderRadius: 50, marginBottom: 8,
  },
  avatarPlaceholder: {
    width: 100, height: 100, borderRadius: 50,
    backgroundColor: "#eee", alignItems: "center", justifyContent: "center",
    marginBottom: 8,
  },
  photoButton: {
    backgroundColor: "#2E4098", paddingVertical: 6, paddingHorizontal: 16,marginBottom: 40,
    borderRadius: 6,
  },
  photoButtonText: { color: "#fff", fontWeight: "600" },
});
