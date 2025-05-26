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

const ProfileScreen = () => {
  const router = useRouter();
  const { profile, updateUser } = useContext(AuthContext);

  const [name, setName] = useState(profile?.name ?? "");
  const [role, setRole] = useState<"comprador" | "vendedor">(
    profile?.role ?? "comprador"
  );
  const [photoUri, setPhotoUri] = useState<string | undefined>(
    profile?.photoURL
  );
  const [cameraVisible, setCameraVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!name) {
      return Alert.alert("Campo requerido", "El nombre no puede quedar vacío.");
    }

    setLoading(true);
    try {
      let photoFile;
      if (photoUri && photoUri !== profile?.photoURL) {
        // convertimos URI a Blob para updateUser
        const resp = await fetch(photoUri);
        photoFile = await resp.blob();
      }

      await updateUser({
        name,
        role,
        ...(photoFile ? { photoFile } : {}),
      });

      Alert.alert("¡Listo!", "Perfil actualizado correctamente.", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (e: any) {
      console.error(e);
      Alert.alert("Error", e.message || "No se pudo guardar los cambios.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.back()}
      >
        <Ionicons name="arrow-back" size={24} color="#000" />
      </TouchableOpacity>

      <Text style={styles.title}>Mi perfil</Text>

      {/* --- FOTO DE PERFIL --- */}
      <View style={styles.photoSection}>
        {photoUri ? (
          <Image source={{ uri: photoUri }} style={styles.avatar} />
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
            {photoUri ? "Cambiar foto" : "Tomar foto"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Nombre */}
      <Text style={styles.label}>Nombre</Text>
      <TextInput
        style={styles.input}
        placeholder="Tu nombre"
        value={name}
        onChangeText={setName}
      />

      {/* Rol */}
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
            role === "comprador"
              ? styles.roleSelected
              : styles.roleUnselected,
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

      {/* Modal de cámara */}
      <CameraModal
        isVisible={cameraVisible}
        onClose={() => setCameraVisible(false)}
        onCapture={(url) => {
          setPhotoUri(url);
          setCameraVisible(false);
        }}
      />

      {/* Botón Guardar */}
      <TouchableOpacity
        style={[styles.registerButton, loading && { opacity: 0.7 }]}
        onPress={handleSave}
        disabled={loading}
      >
        <Text style={styles.registerText}>
          {loading ? "Guardando..." : "Guardar cambios"}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default ProfileScreen;

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
  photoSection: {
    alignItems: "center",
    marginBottom: 24,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 8,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#eee",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  photoButton: {
    backgroundColor: "#2E4098",
    paddingVertical: 6,
    paddingHorizontal: 16,
    marginBottom: 32,
    borderRadius: 6,
  },
  photoButtonText: {
    color: "#fff",
    fontWeight: "600",
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
    paddingVertical: 14,
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
