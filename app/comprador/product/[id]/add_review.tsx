import { AuthContext } from "@/context/AuthContext";
import { useProducts } from "@/context/ProductContext";
import { Ionicons } from "@expo/vector-icons";
import Slider from "@react-native-community/slider";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useContext, useState } from "react";
import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";

export default function AddReviewScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const { addReview } = useProducts();
  const { currentUser } = useContext(AuthContext);

  const [comment, setComment] = useState("");
  const [rating, setRating] = useState(2.5);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!comment.trim()) {
      Alert.alert("Error", "Por favor escribe tu experiencia.");
      return;
    }

    if (!currentUser) {
      Alert.alert("Debes estar logueado para dejar una reseña.");
      return;
    }

    setLoading(true);

    try {
      await addReview(id as string, {
        userId: currentUser.uid,
        photoURL: currentUser.photoURL || "https://i.pravatar.cc/100",
        name: currentUser.displayName || "Anónimo",
        rating,
        comment,
      });

      Alert.alert("Gracias!", "Tu reseña fue enviada exitosamente.");
      router.back();
    } catch (err) {
      Alert.alert("Error", "No se pudo enviar la reseña.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={20} />
          </TouchableOpacity>
          <Text style={styles.title}>Añadir Review</Text>
          <View style={{ width: 20 }} />
        </View>

        {/* Campo de experiencia */}
        <Text style={styles.label}>¿Cómo fue tu experiencia?</Text>
        <TextInput
          style={styles.textInput}
          placeholder="Escribe tu reseña aquí..."
          placeholderTextColor="#ccc"
          multiline
          numberOfLines={5}
          value={comment}
          onChangeText={setComment}
        />

        {/* Calificación */}
        <View style={styles.sliderHeader}>
          <Text style={styles.label}>Calificación</Text>
          <View style={styles.ratingValue}>
            <Ionicons name="star" size={16} color="#F5C518" />
            <Text style={styles.ratingText}>{rating.toFixed(1)}</Text>
          </View>
        </View>

        <View style={styles.sliderRow}>
          <Text style={styles.sliderValue}>0.0</Text>
          <Slider
            style={styles.slider}
            minimumValue={0}
            maximumValue={5}
            step={0.5}
            minimumTrackTintColor="#3B4CCA"
            maximumTrackTintColor="#eee"
            value={rating}
            onValueChange={setRating}
          />
          <Text style={styles.sliderValue}>5.0</Text>
        </View>

        {/* Botón de envío */}
        <TouchableOpacity
          style={[styles.submitButton, loading && { opacity: 0.6 }]}
          onPress={handleSubmit}
          disabled={loading}
        >
          <Text style={styles.submitText}>Submit Review</Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
    paddingTop: 60,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 30,
  },
  backButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#F4F4F4",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontWeight: "bold",
    fontSize: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 8,
    marginTop: 12,
  },
  textInput: {
    backgroundColor: "#F9F9F9",
    borderRadius: 12,
    padding: 16,
    fontSize: 14,
    textAlignVertical: "top",
    color: "#000",
  },
  sliderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
  },
  ratingValue: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 4,
  },
  sliderRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  slider: {
    flex: 1,
    marginHorizontal: 10,
  },
  sliderValue: {
    fontSize: 12,
    color: "#555",
    width: 30,
    textAlign: "center",
  },
  submitButton: {
    marginTop: 30,
    backgroundColor: "#2E4098",
    paddingVertical: 14,
    alignItems: "center",
    borderRadius: 6,
  },
  submitText: {
    color: "#fff",
    fontWeight: "bold",
  },
});
