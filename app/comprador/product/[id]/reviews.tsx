import { useProducts } from "@/context/ProductContext";
import { Ionicons } from "@expo/vector-icons";
import { format } from "date-fns";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface Review {
  id: string;
  userId: string;
  name: string;
  rating: number;
  createdAt: Date; // ajusta si es Timestamp de Firestore
  comment: string;
  photoURL?: string; // URL de la foto del usuario
}

export default function AllReviewsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { products } = useProducts();

  const product = products.find((p) => p.id === id);
  if (!product) return <Text style={styles.notFound}>Producto no encontrado.</Text>;

  const averageRating =
  product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length || 0;
const renderStars = (rating: number) => {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    if (rating >= i) {
      stars.push(<Ionicons key={i} name="star" size={18} color="#F5C518" />);
    } else if (rating >= i - 0.5) {
      stars.push(<Ionicons key={i} name="star-half" size={18} color="#F5C518" />);
    } else {
      stars.push(<Ionicons key={i} name="star-outline" size={18} color="#F5C518" />);
    }
  }
  return stars;
};


  const renderReview = ({ item }: { item: Review }) => (
    <View style={styles.reviewCard}>
      <Image
        source={{ uri: item.photoURL || "https://i.pravatar.cc/100" }}
        style={styles.avatar}
      />
      <View style={styles.reviewContent}>
        <View style={styles.reviewHeader}>
          <Text style={styles.reviewer}>{item.name}</Text>
          {/* Rating completo dentro de un Text */}
          <Text style={styles.ratingInline}>
            <Text style={styles.ratingText}>{item.rating.toFixed(1)}</Text>
            <Text style={styles.ratingSub}> rating </Text>
            <Ionicons name="star" size={14} color="#F5C518" />
          </Text>
        </View>
        <Text style={styles.reviewDate}>
          {format(
            // si es Firestore Timestamp, usar item.createdAt.toDate()
            (item.createdAt as any)?.toDate?.() || item.createdAt || new Date(),
            "dd MMM, yyyy"
          )}
        </Text>
        <Text style={styles.reviewText}>{item.comment}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Encabezado */}
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} />
        </TouchableOpacity>
        <Text style={styles.title}>Reviews</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Resumen + Botón */}
      <View style={styles.summaryRow}>
        <View>
          <Text style={styles.meta}>{product.reviews.length} Reseñas</Text>
          <View style={styles.starsRow}>
          <Text style={styles.avgRating}>{averageRating.toFixed(1)}</Text>
          {renderStars(averageRating)}
        </View>

        </View>

        <TouchableOpacity style={styles.addButton} onPress={() => router.push(`/comprador/product/${id}/add_review`)}>  
          <Ionicons name="add" size={16} color="#fff" />
          <Text style={styles.addButtonText}>Añadir Review</Text>
        </TouchableOpacity>
      </View>

      {/* Lista de reseñas */}
      <FlatList
        data={product.reviews}
        keyExtractor={(item) => item.id}
        renderItem={renderReview}
        contentContainerStyle={{ paddingBottom: 30 }}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 20,
    paddingTop: 70,
  },
  notFound: {
    padding: 20,
    textAlign: "center",
    color: "#666",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2E4098",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  addButtonText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
    marginLeft: 4,
  },
  meta: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  starsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  avgRating: {
    fontSize: 20,
    fontWeight: "bold",
    marginRight: 6,
  },
  reviewCard: {
    flexDirection: "row",
    marginBottom: 20,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 12,
  },
  reviewContent: {
    flex: 1,
  },
  reviewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  reviewer: {
    fontWeight: "bold",
    fontSize: 14,
  },
  ratingInline: {
    flexDirection: "row",
    alignItems: "center",
    fontSize: 13,
    // color por defecto, los hijos Text aplican sus estilos
  },
  ratingText: {
    fontWeight: "bold",
    fontSize: 13,
    color: "#333",
  },
  ratingSub: {
    fontSize: 11,
    color: "#666",
  },
  reviewDate: {
    color: "#999",
    fontSize: 12,
    marginBottom: 4,
  },
  reviewText: {
    fontSize: 13,
    color: "#333",
    lineHeight: 18,
  },
});
