import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import {
    Alert,
    FlatList,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

import { useFavorites } from "@/context/FavoritesContext";
import { Product } from "@/context/ProductContext";

export default function FavoritesScreen() {
  const router = useRouter();
  const { favorites, isFavorite, toggleFavorite } = useFavorites();

  const handleToggle = async (item: Product) => {
    const currentlyFav = isFavorite(item.id);
    await toggleFavorite(item);
    Alert.alert(
      currentlyFav ? "Favorito eliminado" : "Favorito agregado",
      `"${item.title}" ${
        currentlyFav ? "ha sido removido de" : "se agregó a"
      } favoritos.`
    );
  };

  if (favorites.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Aún no tienes productos favoritos.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Título fijo */}
      <Text style={styles.headerTitle}>Tus favoritos</Text>
              <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                <Ionicons name="arrow-back" size={28} color="#000" />
              </TouchableOpacity>

      <FlatList
        data={favorites}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.listContainer}
        columnWrapperStyle={styles.columnWrapper}
        renderItem={({ item }) => {
          const fav = isFavorite(item.id);
          return (
            <TouchableOpacity
              style={styles.card}
              onPress={() =>
                router.push({
                  pathname: "../comprador/product/[id]",
                  params: { id: item.id },
                })
              }
              activeOpacity={0.8}
            >
              <View style={styles.imageWrapper}>
                <Image source={{ uri: item.image }} style={styles.cardImage} />
                <TouchableOpacity
                  style={[
                    styles.favoriteIcon,
                    fav
                      ? { backgroundColor: "#e74c3c" }
                      : { backgroundColor: "rgba(255,255,255,0.8)" },
                  ]}
                  onPress={() => handleToggle(item)}
                >
                  <Ionicons
                    name={fav ? "heart" : "heart-outline"}
                    size={24}
                    color={fav ? "#fff" : "#e74c3c"}
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
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
    backgroundColor: "#fff",
  },
  headerTitle: {
    paddingHorizontal: 20,
    fontSize: 28,
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 25,
    textAlign: "center",
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  columnWrapper: {
    justifyContent: "space-between",
    marginBottom: 20,
  },
  card: {
    width: "48%",
    borderRadius: 10,
    backgroundColor: "#fff",
    overflow: "hidden",
  },
  imageWrapper: {
    position: "relative",
  },
  cardImage: {
    width: "100%",
    height: 170,
  },
  favoriteIcon: {
    position: "absolute",
    top: 8,
    right: 8,
    borderRadius: 16,
    padding: 4,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginHorizontal: 8,
    marginTop: 8,
  },
  cardPrice: {
    fontSize: 13,
    color: "#333",
    marginHorizontal: 8,
    marginBottom: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
  },
    backButton: {
    position: "absolute",
    top: 75,
    left: 8,
    padding: 6,
    zIndex: 10,
  },
});
