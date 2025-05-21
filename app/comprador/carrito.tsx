import Ionicons from "@expo/vector-icons/Ionicons";
import { Picker } from '@react-native-picker/picker';
import { router } from "expo-router";
import React, { useContext, useState } from "react";
import {
  Alert,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { AuthContext } from "../../context/AuthContext";
import { MeetingPoint, PaymentMethod, useCart } from "../../context/CartContext";
import { useProducts } from "../../context/ProductContext";



const TAX_RATE = 0.19;

// Define available meeting points
const meetingPoints : MeetingPoint[] = [
  "Edificio K",
  "Ad Portas",
  "Villa de Leyva",
  "Edificio G",
  "Edificio D",
  "Edificio O",
  "Biblioteca",
  "Edificio Atelier",
  "Edificio H",
  "Anfiteatro",
  "CAF",
  "Meson",
  "Edificio A",
  "Edificio B",
  "Edificio C",
] ;

// Define available payment methods
const paymentMethods: PaymentMethod[] = ["Efectivo", "Nequi", "Llaves"];

const CartScreen = () => {
  const { cart, incrementQuantity, decrementQuantity, removeFromCart, placeOrder } = useCart();
  const { products } = useProducts();
  const { currentUser } = useContext(AuthContext);

  const [showMeetingPointPicker, setShowMeetingPointPicker] = useState(false);
  const [showPaymentMethodPicker, setShowPaymentMethodPicker] = useState(false);

  const [selectedMeetingPoint, setSelectedMeetingPoint] = useState<MeetingPoint>("Edificio K");
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod>("Efectivo");

  const cartWithDetails = cart
    .map(({ productId, quantity }) => {
      const product = products.find((p) => p.id === productId);
      if (!product) return null;
      return { ...product, quantity };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);

  const subtotal = cartWithDetails.reduce(
    (sum, p) => sum + p.price * p.quantity,
    0
  );
  const taxes = Math.round(subtotal * TAX_RATE);
  const total = subtotal + taxes;

  const onCheckout = async () => {
    if (!currentUser) {
      Alert.alert("Error", "Debes iniciar sesión para hacer el pedido");
      return;
    }
    try {
      await placeOrder(currentUser.uid, selectedMeetingPoint, selectedPaymentMethod);
      Alert.alert("Éxito", "Tu orden fue creada correctamente");
      router.push("/comprador/ordenconfirmada");
    } catch (error: any) {
      Alert.alert("Error", error.message);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={28} color="#000" />
        </TouchableOpacity>
        <Text style={styles.title}>Carrito</Text>

        {cartWithDetails.length === 0 && (
          <Text style={{ textAlign: "center", marginTop: 20 }}>
            El carrito está vacío
          </Text>
        )}

        {cartWithDetails.map((item) => (
          <View key={item.id} style={styles.card}>
            <Image source={{ uri: item.image }} style={styles.image} />
            <View style={styles.info}>
              <Text style={styles.productTitle}>{item.title}</Text>
              <Text style={styles.price}>
                ${item.price.toLocaleString()} COP
              </Text>
              <View style={styles.quantityRow}>
                <TouchableOpacity
                  onPress={() => decrementQuantity(item.id)}
                  style={styles.qtyButton}
                >
                  <Ionicons name="chevron-down" size={24} />
                </TouchableOpacity>
                <Text style={styles.qtyText}>{item.quantity}</Text>
                <TouchableOpacity
                  onPress={() => incrementQuantity(item.id)}
                  style={styles.qtyButton}
                >
                  <Ionicons name="chevron-up" size={24} />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => removeFromCart(item.id)}
                  style={styles.deleteButton}
                >
                  <Ionicons name="trash-outline" size={22} color="#888" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ))}

        <TouchableOpacity
          style={styles.sectionHeader}
          onPress={() => {
            setShowMeetingPointPicker(true);
            setShowPaymentMethodPicker(false);
          }}
        >
          <Text style={styles.sectionTitle}>Punto de Encuentro</Text>
          <Ionicons name="chevron-forward" size={20} />
        </TouchableOpacity>

        {showMeetingPointPicker ? (
          <Picker
            selectedValue={selectedMeetingPoint}
            onValueChange={(itemValue) => {
              setSelectedMeetingPoint(itemValue);
              setShowMeetingPointPicker(false);
            }}
          >
            {meetingPoints.map((mp) => (
              <Picker.Item key={mp} label={mp} value={mp} />
            ))}
          </Picker>
        ) : (
          <View style={styles.selectionContainer}>
            <Ionicons name="location-outline" size={24} color="#4caf50" />
            <Text style={styles.selectionText}>{selectedMeetingPoint}</Text>
            <Ionicons name="checkmark-circle" size={20} color="#4caf50" />
          </View>
        )}

        {/* Método de pago */}
        <TouchableOpacity
          style={styles.sectionHeader}
          onPress={() => {
            setShowPaymentMethodPicker(true);
            setShowMeetingPointPicker(false);
          }}
        >
          <Text style={styles.sectionTitle}>Método de Pago</Text>
          <Ionicons name="chevron-forward" size={20} />
        </TouchableOpacity>

        {showPaymentMethodPicker ? (
          <Picker
            selectedValue={selectedPaymentMethod}
            onValueChange={(itemValue) => {
              setSelectedPaymentMethod(itemValue);
              setShowPaymentMethodPicker(false);
            }}
          >
            {paymentMethods.map((pm) => (
              <Picker.Item key={pm} label={pm} value={pm} />
            ))}
          </Picker>
        ) : (
          <View style={styles.selectionContainer}>
            <Text style={{ fontWeight: "bold" }}>{selectedPaymentMethod}</Text>
            <Text style={styles.paymentNote}>Acuerda detalles con el vendedor</Text>
            <Ionicons name="checkmark-circle" size={20} color="#4caf50" />
          </View>
        )}

        <Text style={styles.orderInfoTitle}>Order Info</Text>
        <View style={styles.priceRow}>
          <Text>Subtotal</Text>
          <Text>${subtotal.toLocaleString()} COP</Text>
        </View>
        <View style={styles.priceRow}>
          <Text>Impuestos 19%</Text>
          <Text>${taxes.toLocaleString()} COP</Text>
        </View>
        <View style={[styles.priceRow, styles.totalRow]}>
          <Text>Total</Text>
          <Text>${total.toLocaleString()} COP</Text>
        </View>
      </ScrollView>

      <TouchableOpacity style={styles.checkoutBtn} onPress={onCheckout}>
        <Text style={styles.checkoutText}>Checkout</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#fff" },
  container: { flex: 1, paddingHorizontal: 16 },
  backButton: {
    position: "absolute",
    top: 16,
    left: 8,
    padding: 6,
    zIndex: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    marginTop: 20,
    marginBottom: 16,
    textAlign: "center",
  },
  card: {
    flexDirection: "row",
    backgroundColor: "#fff",
    marginBottom: 14,
    borderRadius: 10,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    padding: 10,
  },
  image: {
    width: 100,
    height: 80,
    borderRadius: 8,
  },
  info: {
    flex: 1,
    marginLeft: 12,
    justifyContent: "space-between",
  },
  productTitle: {
    fontWeight: "600",
    fontSize: 16,
  },
  price: {
    fontWeight: "bold",
    fontSize: 14,
    color: "#444",
  },
  quantityRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
  },
  qtyButton: {
    paddingHorizontal: 8,
  },
  qtyText: {
    marginHorizontal: 12,
    fontWeight: "bold",
    fontSize: 16,
  },
  deleteButton: {
    marginLeft: "auto",
    paddingHorizontal: 8,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomColor: "#ddd",
    borderBottomWidth: 1,
    marginTop: 16,
  },
  sectionTitle: {
    fontWeight: "700",
    fontSize: 16,
  },
  selectionContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomColor: "#ddd",
    borderBottomWidth: 1,
  },
  selectionText: {
    marginLeft: 8,
    flex: 1,
    fontWeight: "600",
    fontSize: 15,
  },
  paymentNote: {
    color: "#666",
    marginLeft: 8,
    fontSize: 13,
  },
  orderInfoTitle: {
    fontWeight: "700",
    fontSize: 18,
    marginTop: 16,
    marginBottom: 8,
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 4,
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: "#bbb",
    paddingTop: 10,
    fontWeight: "700",
  },
  checkoutBtn: {
    backgroundColor: "#2E4098",
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 75,
    justifyContent: "center",
    alignItems: "center",
  },
  checkoutText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 18,
  },
});

export default CartScreen;
