import { useCurrency } from "@/context/CurrencyContext";
import { ProductContext } from "@/context/ProductContext";
import { Ionicons } from "@expo/vector-icons";
import { format } from "date-fns";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useContext } from "react";

import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
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

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { products } = useContext(ProductContext);



  const product = products.find((p) => p.id === id);
const { currency, setCurrency, rates, loading } = useCurrency();
// Define the Currency type

const order:  ("COP" | "USD" | "EUR" | "MXN")[]= ["COP", "USD", "EUR", "MXN"];
const conversionRate = rates?.[currency] ?? 1;
const convertedPrice = (product: { price: number; }) => (product.price * conversionRate).toFixed(2);
const firstReview = product?.reviews?.[0];
console.log("First Review", firstReview);

const handleChangeCurrency = () => {
  const index = order.indexOf(currency);
  const next = order[(index + 1) % order.length];
  setCurrency(next);
};



  if (!product) {
    return (
      <View style={styles.container}>
        <Text>Producto no encontrado.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Imagen superior */}
      <Image source={{ uri: product.image }} style={styles.image} />

      {/* Botones superior izquierdo y derecho */}
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={24} color="#000" />
      </TouchableOpacity>

      <TouchableOpacity style={styles.cartButton}>
        <Ionicons name="cart" size={24} color="#000" />
      </TouchableOpacity>

      <View style={styles.detailContainer}>
        <View style={styles.categoryIcon}>
          <Ionicons
            name={
              categories.find((category) => category.name === product.category)
            ?.icon || "help-circle"
            }
            size={24}
            color="#000"
          />
        </View>

        <Text style={styles.category}>{product.category}</Text>
        <Text style={styles.title}>{product.title}</Text>

        <View style={styles.priceRow}>
        <View>
        <Text style={styles.priceLabel}>Precio</Text>
        <Text style={styles.price}>
            {currency === "COP" ? `$${product.price.toLocaleString()} COP` : `$${convertedPrice(product)} ${currency}`}
        </Text>
        </View>
        <TouchableOpacity style={styles.currencyButton} onPress={handleChangeCurrency}>
        <Text style={styles.currencyButtonText}>Cambiar Divisa</Text>
        </TouchableOpacity>

        </View>

        <Text style={styles.sectionTitle}>Descripción</Text>
        <Text style={styles.description}>
          {product.description}
        </Text>

        <View style={styles.reviewRow}>
  <Text style={styles.sectionTitle}>Reviews</Text>
  <TouchableOpacity onPress={() => router.push({ pathname: "../product/[id]/reviews", params: { id: product.id } })}
>
    <Text style={styles.viewAll}>Ver todo</Text>
  </TouchableOpacity>
</View>

{firstReview ? (
  <View style={styles.reviewCard}>
    <Image
      source={{ uri: "https://i.pravatar.cc/100?u=" + firstReview.userId }}
      style={styles.avatar}
    />
    <View style={{ flex: 1 }}>
      <Text style={styles.reviewer}>{firstReview.name}</Text>
      <Text style={styles.reviewDate}>
        {format(
          typeof firstReview.createdAt?.toDate === "function"
            ? firstReview.createdAt.toDate()
            : new Date(firstReview.createdAt),
          "dd MMM, yyyy"
        )}
      </Text>
      <Text numberOfLines={2} style={styles.reviewText}>
        {firstReview.comment}
      </Text>
    </View>
    <View style={styles.rating}>
      <Text style={{ fontWeight: "bold", marginBottom: 2 }}>
        {firstReview.rating.toFixed(1)}
      </Text>
      <Ionicons name="star" color="#F5C518" size={16} />
    </View>
  </View>
) : (
  <Text style={{ color: "#999",marginBottom:10 }}>Aún no hay reseñas.</Text>
)}

        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Precio Total</Text>
          <Text style={styles.totalPrice}>${product.price.toLocaleString()}</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.addToCartButton}>
        <Text style={styles.addToCartText}>Add to Cart</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  image: {
    width: "100%",
    height: 260,
    resizeMode: "cover",
  },
  backButton: {
    position: "absolute",
    top: 50,
    left: 20,
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 8,
    elevation: 3,
  },
  cartButton: {
    position: "absolute",
    top: 50,
    right: 20,
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 8,
    elevation: 3,
  },
  detailContainer: {
    padding: 20,
    paddingBottom: 120,
  },
  categoryIcon: {
    backgroundColor: "#fff",
    alignSelf: "center",
    padding: 12,
    borderRadius: 30,
    marginTop: -40,
    marginBottom: 10,
    elevation: 2,
  },
  category: {
    textAlign: "center",
    color: "#999",
    fontSize: 13,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  priceLabel: {
    fontSize: 13,
    color: "#666",
  },
  price: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#000",
  },
  currencyButton: {
    backgroundColor: "#8BC34A",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
  },
  currencyButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginVertical: 10,
  },
  description: {
    fontSize: 14,
    color: "#555",
    lineHeight: 20,
    marginBottom: 20,
  },
  reviewRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  viewAll: {
    color: "#6C63FF",
    fontWeight: "600",
  },
  reviewCard: {
    flexDirection: "row",
    backgroundColor: "#F9F9F9",
    borderRadius: 10,
    padding: 12,
    marginBottom: 20,
    alignItems: "flex-start",
    gap: 10,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    marginTop: 4,
  },
  reviewer: {
    fontWeight: "bold",
    fontSize: 14,
  },
  reviewDate: {
    color: "#aaa",
    fontSize: 12,
    marginBottom: 4,
  },
  reviewText: {
    fontSize: 13,
    color: "#333",
  },
  rating: {
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "#eee",
    paddingTop: 10,
  },
  totalLabel: {
    fontWeight: "600",
    fontSize: 15,
    color: "#555",
  },
  totalPrice: {
    fontWeight: "bold",
    fontSize: 16,
    color: "#000",
  },
  addToCartButton: {
    position: "absolute",
    height: 75,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#2E4098",
    paddingVertical: 16,
    alignItems: "center",
  },
  addToCartText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});
