// app/vendedor/ManageProducts.tsx

import { useRouter } from "expo-router";
import React, { useContext, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Modal from "react-native-modal";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { AuthContext } from "../../context/AuthContext";
import { Product, useProducts } from "../../context/ProductContext";

export default function ManageProducts() {
  const router = useRouter();
  const { currentUser } = useContext(AuthContext);
  const {
    products,
    loading,
    error,
    deleteProduct,
    updateProduct,
  } = useProducts();

  const [filtered, setFiltered] = useState<Product[]>([]);
  const [search, setSearch] = useState("");

  // Edit modal state
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editStock, setEditStock] = useState("");
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (!currentUser) return;
    let vend = products.filter(p => p.sellerId === currentUser.uid);
    if (search.trim()) {
      vend = vend.filter(p =>
        p.title.toLowerCase().includes(search.toLowerCase())
      );
    }
    setFiltered(vend);
  }, [products, search, currentUser]);

  if (loading) {
    return (
      <SafeAreaView style={styles.loader}>
        <ActivityIndicator size="large" />
      </SafeAreaView>
    );
  }
  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>Error: {error}</Text>
      </SafeAreaView>
    );
  }


  const openEditModal = (product: Product) => {
    setProductToEdit(product);
    setEditTitle(product.title);
    setEditPrice(product.price.toString());
    setEditStock(product.stock.toString());
    setEditModalVisible(true);
  };

  const handleUpdate = async () => {
    if (!productToEdit) return;
    if (!editTitle || !editPrice || !editStock) {
      return Alert.alert("Error", "Todos los campos son requeridos");
    }
    setUpdating(true);
    try {
      await updateProduct(productToEdit.id, {
        title: editTitle,
        price: parseFloat(editPrice),
        stock: parseInt(editStock, 10),
      });
      setEditModalVisible(false);
    } catch (e: any) {
      Alert.alert("Error", e.message);
    } finally {
      setUpdating(false);
    }
  };

  const renderItem = ({ item }: { item: Product }) => (
    <View style={styles.card}>
      <Image source={{ uri: item.image }} style={styles.image} />
      <View style={styles.info}>
        <Text style={styles.productTitle}>{item.title}</Text>
        <Text style={styles.category}>{item.category}</Text>
        <Text style={styles.price}>${item.price.toFixed(2)}</Text>
        <Text style={styles.stock}>Stock: {item.stock}</Text>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.btnEdit}
          onPress={() => openEditModal(item)}
        >
          <Icon name="pencil-outline" size={20} color="#FFF" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Icon name="arrow-left" size={28} />
        </TouchableOpacity>
        <Text style={styles.title}>Mis Productos</Text>
      </View>

      {/* Search */}
      <View style={styles.searchWrapper}>
        <Icon name="magnify" size={20} color="#AAA" />
        <TextInput
          placeholder="Buscar mis productos..."
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* Lista */}
      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        renderItem={renderItem}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>
              No tienes productos{search ? " que coincidan con la búsqueda" : ""}.
            </Text>
          </View>
        }
      />

      {/* Edit Modal */}
      <Modal
        isVisible={editModalVisible}
        onBackdropPress={() => setEditModalVisible(false)}
      >
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Editar Producto</Text>

          <Text style={styles.modalLabel}>Nombre</Text>
          <TextInput
            style={styles.modalInput}
            value={editTitle}
            onChangeText={setEditTitle}
          />

          <Text style={styles.modalLabel}>Precio</Text>
          <TextInput
            style={styles.modalInput}
            value={editPrice}
            onChangeText={setEditPrice}
            keyboardType="numeric"
          />

          <Text style={styles.modalLabel}>Stock</Text>
          <TextInput
            style={styles.modalInput}
            value={editStock}
            onChangeText={setEditStock}
            keyboardType="numeric"
          />

          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={[styles.modalBtn, styles.cancelBtn]}
              onPress={() => setEditModalVisible(false)}
              disabled={updating}
            >
              <Text style={styles.modalBtnText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalBtn, styles.saveBtn]}
              onPress={handleUpdate}
              disabled={updating}
            >
              <Text style={[styles.modalBtnText, { color: "#fff" }]}>
                {updating ? "Guardando..." : "Guardar"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFF", padding: 16 },
  loader: { flex: 1, justifyContent: "center", alignItems: "center" },
  errorText: { color: "red", textAlign: "center" },

  header: { flexDirection: "row", alignItems: "center" },
  title: { fontSize: 20, fontWeight: "bold", marginLeft: 12 },

  searchWrapper: {
    flexDirection: "row",
    backgroundColor: "#F9F9F9",
    borderRadius: 8,
    paddingHorizontal: 12,
    alignItems: "center",
    marginTop: 24,
    height: 40,
  },
  searchInput: { flex: 1, marginLeft: 8 },

  list: { paddingVertical: 16 },

  card: {
    flexDirection: "row",
    backgroundColor: "#F9F9F9",
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 12,
  },
  image: { width: 100, height: 100 },
  info: {
    flex: 1,
    padding: 12,
    justifyContent: "space-between",
  },
  productTitle: { fontWeight: "600", fontSize: 16 },
  category: { color: "#777", fontSize: 13 },
  price: { fontWeight: "bold", fontSize: 16 },
  stock: { color: "#555", fontSize: 14 },

  actions: {
    justifyContent: "space-around",
    padding: 8,
  },
  btnEdit: {
    backgroundColor: "#6C63FF",
    padding: 8,
    borderRadius: 8,
  },
  btnDelete: {
    backgroundColor: "#EF4444",
    padding: 8,
    borderRadius: 8,
  },
  empty: { marginTop: 40, alignItems: "center" },
  emptyText: { color: "#777" },

  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
  },
  modalTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 12 },
  modalLabel: { fontWeight: "600", marginTop: 8 },
  modalInput: {
    backgroundColor: "#F1F1F1",
    borderRadius: 6,
    padding: 10,
    marginTop: 4,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 16,
  },
  modalBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 6,
    marginLeft: 8,
  },
  cancelBtn: {
    backgroundColor: "#ccc",
  },
  saveBtn: {
    backgroundColor: "#6C63FF",
  },
  modalBtnText: {
    fontWeight: "600",
  },
});
