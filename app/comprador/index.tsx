import Sidebar from "@/components/SidebarComprador";
import { AuthContext } from "@/context/AuthContext";
import { useFavorites } from "@/context/FavoritesContext";
import { Product, ProductContext } from "@/context/ProductContext";
import { useGeminiSearch } from "@/hooks/useGeminiSearch";
import { Feather, Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useContext, useState } from "react";
import Modal from "react-native-modal";

import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Keyboard, // 🚀
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const router = useRouter();



const categories = [
  { name: "Tecnología", icon: "laptop" as const },
  { name: "Libros", icon: "book" as const },
  { name: "Ropa", icon: "shirt" as const },
  { name: "Hogar", icon: "home" as const },
  { name: "Papelería", icon: "document-text" as const },
  { name: "Deportes", icon: "football" as const },
  { name: "Arte", icon: "color-palette" as const },
  { name: "Música", icon: "musical-notes" as const },
  { name: "Alimentos", icon: "fast-food" as const },
  { name: "Otros", icon: "ellipsis-horizontal" as const },
];

const HomeScreen = () => {
  const router = useRouter();
  const { currentUser } = useContext(AuthContext);
  const { products } = useContext(ProductContext);
  const { isFavorite, toggleFavorite } = useFavorites();

  
  const { getKeywords, loading: aiLoading } = useGeminiSearch(); // 🚀
  const [aiKeywords, setAiKeywords] = useState<string[]>([]);    // 🚀

  const [query, setQuery] = useState("");
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [modalVisible, setModalVisible] = useState(false);

 // 🚀 Nuevo filtrado que usa aiKeywords si las hay, sino usa el search normal
  const filteredProducts = products.filter((p) => {
    const matchesText = aiKeywords.length > 0
      ? aiKeywords.some((k) =>
          p.title.toLowerCase().includes(k.toLowerCase()) ||
          p.description.toLowerCase().includes(k.toLowerCase())
        )
      : p.title.toLowerCase().includes(search.toLowerCase());

    const matchesCategory =
      selectedCategory === "" || p.category === selectedCategory;

    return matchesText && matchesCategory;
  });


    const handleToggleFav = async (product: Product) => {
    const currentlyFav = isFavorite(product.id);
    await toggleFavorite(product);
    Alert.alert(
      currentlyFav ? "Favorito eliminado" : "Favorito agregado",
      `"${product.title}" ${currentlyFav ? "ha sido removido de" : "se agregó a"} favoritos.`
    );
  };

  // 🚀 Lógica para invocar Gemini cuando tocan el ✨
  const handleAISearch = async () => {
    if (!query.trim()) {
      return Alert.alert("Ingresa texto", "Describe lo que buscas.");
    }
    try {
      const keywords = await getKeywords(query);
      if (keywords.length === 0) {
        return Alert.alert("Sin resultados", "La IA no devolvió palabras clave.");
      }
      setAiKeywords(keywords);
      setSearch("");  // opcional: limpia el search manual
      Alert.alert("Palabras clave", keywords.join(", "));
    } catch (e) {
      console.error(e);
      Alert.alert("Error IA", "No se pudo obtener palabras clave.");
    }
  };

  return (

    
    <View style={styles.container}>

    <Modal
      isVisible={modalVisible}
      animationIn="slideInLeft"
      animationOut="slideOutLeft"
      onBackdropPress={() => setModalVisible(false)}
      style={{ margin: 0, justifyContent: "flex-start" }}
    >
      <View style={{ width: "75%", height: "100%", backgroundColor: "#fff" }}>
        <Sidebar onClose={() => setModalVisible(false)} />
      </View>
    </Modal>

      {/* Encabezado fijo */}
      <View style={styles.headerContainer}>
        <View style={styles.header}>
          <Ionicons name="menu" size={24} onPress={() => setModalVisible(true)} />
{/* 🚀 Botón IA */}
          <TouchableOpacity
            style={styles.avatar}
            onPress={handleAISearch}
            disabled={aiLoading}
          >
            {aiLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Ionicons name="sparkles" size={24} color="#fff" />
            )}
          </TouchableOpacity>
        </View>

        <Text style={styles.greeting}>Hola, {currentUser?.displayName?.split(" ")[0]} </Text>
        <Text style={styles.subtitle}>Bienvenido a S2Market.</Text>

        <View style={styles.searchBox}>
          <Feather name="search" size={18} color="#999" style={{ marginRight: 8 }} />
          <TextInput
            placeholder="Search..."
            style={{ flex: 1 }}
            value={query}
            onChangeText={setQuery}
            returnKeyType="search"
            onSubmitEditing={() => {
              setSearch(query);
              setAiKeywords([]);         // 🚀 desactiva búsqueda IA
              Keyboard.dismiss();
            }}
          />
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Filtra por Categoría</Text>

        </View>

        <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoryList}
        >
        {categories.map((cat, i) => {
            const isSelected = selectedCategory === cat.name;
            return (
            <TouchableOpacity
                key={i}
                style={[
                styles.categoryItem,
                isSelected && { backgroundColor: "#6C63FF" }
                ]}
                onPress={() => {
                setSelectedCategory(isSelected ? "" : cat.name);
                }}
            >
                <Ionicons
                name={cat.icon}
                size={20}
                color={isSelected ? "#fff" : "#000"}
                />
                <Text style={[styles.categoryText, isSelected && { color: "#fff" }]}>
                {cat.name}
                </Text>
            </TouchableOpacity>
            );
        })}
        </ScrollView>


        {/* Título Productos fijo */}
        <View style={[styles.sectionHeader, { marginTop: 0, paddingTop: 10,marginBottom: 20 }]}>
          <Text style={styles.sectionTitle}>Productos</Text>
        </View>
      </View>

      {/* Lista de productos scrollable */}
      <FlatList
        data={filteredProducts}
        keyExtractor={(item) => item.id}
        numColumns={2}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: 20 }}
        columnWrapperStyle={{
          justifyContent: "space-between",
          marginBottom: 20,
          paddingHorizontal: 20,
        }}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card}
            onPress={() => router.push({ pathname: "../comprador/product/[id]", params: { id: item.id } })}
    >
            
<View style={{ position: "relative" }}>
              <Image source={{ uri: item.image }} style={styles.cardImage} />

              {/* Icono de favorito */}
              <TouchableOpacity
                style={styles.favoriteIcon}
                onPress={() => handleToggleFav(item)}
              >
                <Ionicons
                  name={isFavorite(item.id) ? "heart" : "heart-outline"}
                  size={24}
                  color="#e74c3c"
                />
              </TouchableOpacity>
            </View>
               <Text numberOfLines={1} style={styles.cardTitle}>
              {item.title}
            </Text>
            <Text style={styles.cardPrice}>
              ${item.price.toLocaleString()} COP
            </Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal:5,
    backgroundColor: "#fff",
  },
  headerContainer: {
    paddingHorizontal: 20,
    paddingTop: 60,
    backgroundColor: "#fff",
    zIndex: 1, // para mantenerlo arriba de la FlatList
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  avatar: {
    backgroundColor: "#2E4098",
    borderRadius: 10,
    padding: 8,
  },
  greeting: {
    fontSize: 28,
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 4,
  },
  subtitle: {
    color: "#888",
    marginBottom: 20,
  },
  searchBox: {
    backgroundColor: "#F9F9F9",
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  viewAll: {
    color: "#6C63FF",
  },
  categoryList: {
    flexDirection: "row",
    marginBottom: 20,
  },
  categoryItem: {
    backgroundColor: "#F9F9F9",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    marginRight: 10,
  },
  categoryText: {
    marginLeft: 6,
  },
  card: {
    borderRadius: 10,
    width: "48%",
    marginBottom: 10,
  },
  cardImage: {
    width: "100%",
    height: 170,
    borderRadius: 8,
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: "600",
  },
  cardPrice: {
    fontSize: 13,
    color: "#333",
    marginTop: 4,
  },
    favoriteIcon: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "rgba(255,255,255,0.8)",
    borderRadius: 16,
    padding: 4,
  },
});
