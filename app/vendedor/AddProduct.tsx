// app/vendedor/AddProduct.tsx

import { Picker } from "@react-native-picker/picker";
import { useRouter } from "expo-router";
import React, { useContext, useState } from "react";
import {
  Alert,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import CameraModal from "../../components/CameraModal";
import { AuthContext } from "../../context/AuthContext";
import { Category, useProducts } from "../../context/ProductContext";
import { useGeminiPriceCheck } from "../../hooks/useGeminiPriceCheck";

const categories: Category[] = [
  "Tecnología",
  "Libros",
  "Ropa",
  "Hogar",
  "Papelería",
  "Deportes",
  "Arte",
  "Musica",
  "Alimentos",
  "Otros",
];

const AddProduct: React.FC = () => {
  const router = useRouter();
  const { addProduct } = useProducts();
  const { currentUser } = useContext(AuthContext);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<Category>(categories[0]);
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [imageUri, setImageUri] = useState("");
  const [modalVisible, setModalVisible] = useState(false);

  const { checkPrice, loading: checkingPrice } = useGeminiPriceCheck();
  const [priceFeedback, setPriceFeedback] = useState<string | null>(null);

  const handleSave = async () => {
    if (!title || !description || !price || !stock || !imageUri) {
      return Alert.alert("Error", "Todos los campos son obligatorios");
    }
    try {
      if (!currentUser?.uid) throw new Error("Usuario no autenticado");
      await addProduct({
        title,
        description,
        category,
        price: parseFloat(price),
        stock: parseInt(stock, 10),
        image: imageUri,
        sellerId: currentUser.uid,
      });
      Alert.alert("Éxito", "Producto agregado", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (e: any) {
      Alert.alert("Error", e.message);
    }
  };

  const handlePriceCheck = async () => {
    if (!title || !description || !price) {
      return Alert.alert(
        "Error",
        "Debes ingresar nombre, descripción y precio para evaluar."
      );
    }
    try {
      const numericPrice = parseFloat(price);
      const feedback = await checkPrice({
        name: title,
        description,
        price: numericPrice,
      });
      setPriceFeedback(feedback);
    } catch (e: any) {
      console.error(e);
      Alert.alert("Error IA", e.message || "Error al evaluar el precio.");
    }
  };

  // Renderiza el feedback de IA con negrita para los segmentos marcados con **…**
  const renderFeedback = (text: string) => {
    const parts: { text: string; bold: boolean }[] = [];
    let lastIndex = 0;
    const regex = /\*\*([^*]+)\*\*/g;
    let match;
    while ((match = regex.exec(text))) {
      const [full, boldText] = match;
      const index = match.index;
      if (index > lastIndex) {
        parts.push({ text: text.slice(lastIndex, index), bold: false });
      }
      parts.push({ text: boldText, bold: true });
      lastIndex = index + full.length;
    }
    if (lastIndex < text.length) {
      parts.push({ text: text.slice(lastIndex), bold: false });
    }
    return (
      <Text style={styles.feedback}>
        {parts.map((p, i) => (
          <Text key={i} style={p.bold ? styles.feedbackBold : undefined}>
            {p.text}
          </Text>
        ))}
      </Text>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.form}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Icon name="arrow-left" size={28} />
        </TouchableOpacity>
        <Text style={styles.header}>Nuevo Producto</Text>

        <Text style={styles.label}>Nombre</Text>
        <TextInput
          style={styles.input}
          value={title}
          onChangeText={setTitle}
          placeholder="Ej: Brownies"
        />

        <Text style={styles.label}>Descripción</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={description}
          onChangeText={setDescription}
          placeholder="Describe tu producto..."
          multiline
        />

        <Text style={styles.label}>Categoría</Text>
        <View style={styles.pickerBox}>
          <Picker selectedValue={category} onValueChange={setCategory}>
            {categories.map((c) => (
              <Picker.Item key={c} label={c} value={c} />
            ))}
          </Picker>
        </View>

        <Text style={styles.label}>Imagen</Text>
        <TouchableOpacity
          style={styles.imageBox}
          onPress={() => setModalVisible(true)}
        >
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.image} />
          ) : (
            <View style={styles.placeholder}>
              <Icon name="camera" size={32} />
              <Text>Capturar/Seleccionar</Text>
            </View>
          )}
        </TouchableOpacity>

        <View style={styles.row}>
          <View style={styles.half}>
            <Text style={styles.label}>Precio</Text>
            <TextInput
              style={styles.input}
              value={price}
              onChangeText={setPrice}
              placeholder="Ej: 3500"
              keyboardType="numeric"
            />
          </View>
          <View style={styles.half}>
            <Text style={styles.label}>Stock</Text>
            <TextInput
              style={styles.input}
              value={stock}
              onChangeText={setStock}
              placeholder="Ej: 50"
              keyboardType="numeric"
            />
          </View>
        </View>

        {/* Guardar Producto */}
        <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
          <Text style={styles.saveText}>Guardar Producto</Text>
        </TouchableOpacity>

        {/* Verificar Precio (IA) */}
        <TouchableOpacity
          style={[styles.saveBtn, styles.checkBtn]}
          onPress={handlePriceCheck}
          disabled={checkingPrice}
        >
          <Text style={styles.saveText}>
            {checkingPrice ? "Evaluando..." : "Verificar Precio"}
          </Text>
        </TouchableOpacity>

        {/* Feedback IA */}
        {priceFeedback != null && renderFeedback(priceFeedback)}
      </ScrollView>

      <CameraModal
        isVisible={modalVisible}
        onClose={() => setModalVisible(false)}
        onCapture={setImageUri}
      />
    </SafeAreaView>
  );
};

export default AddProduct;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  form: { padding: 16 },
  backButton: { marginBottom: 16 },
  header: { fontSize: 20, fontWeight: "bold", marginBottom: 24 },
  label: { fontWeight: "600", marginBottom: 8 },
  input: {
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  textArea: { height: 100, textAlignVertical: "top" },
  pickerBox: {
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    marginBottom: 16,
  },
  imageBox: {
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    height: 200,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  placeholder: { justifyContent: "center", alignItems: "center" },
  image: { width: "100%", height: "100%", borderRadius: 8 },
  row: { flexDirection: "row", justifyContent: "space-between" },
  half: { width: "48%" },
  saveBtn: {
    backgroundColor: "#3b82f6",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 24,
  },
  checkBtn: {
    backgroundColor: "#10B981",
    marginTop: 12,
  },
  saveText: { color: "#fff", fontWeight: "600" },
  feedback: {
    marginTop: 12,
    fontSize: 14,
    lineHeight: 20,
  },
  feedbackBold: {
    fontWeight: "bold",
  },
});
