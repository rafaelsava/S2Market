import { ProductContext } from "@/context/ProductContext";
import { Feather, Ionicons } from "@expo/vector-icons";
import React, { useContext, useState } from "react";
import {
    FlatList,
    Image,
    Keyboard,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

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
  const { products } = useContext(ProductContext);
  const [query, setQuery] = useState("");
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");



    const filteredProducts = products.filter(product =>
    product.title.toLowerCase().includes(search.toLowerCase()) &&
    (selectedCategory === "" || product.category === selectedCategory)
    );


  return (
    <View style={styles.container}>
      {/* Encabezado fijo */}
      <View style={styles.headerContainer}>
        <View style={styles.header}>
          <Ionicons name="menu" size={24} />
          <View style={styles.avatar}>
            <Ionicons name="sparkles" size={24} color="#fff" />
          </View>
        </View>

        <Text style={styles.greeting}>Hola</Text>
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
              Keyboard.dismiss();
            }}
          />
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Filtra por Categoría</Text>
          <TouchableOpacity>
            <Text style={styles.viewAll}>Ver Todo</Text>
          </TouchableOpacity>
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
          <TouchableOpacity>
            <Text style={styles.viewAll}>Ver Todo</Text>
          </TouchableOpacity>
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
          <TouchableOpacity style={styles.card}>
            <Image source={{ uri: item.image }} style={styles.cardImage} />
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
});
