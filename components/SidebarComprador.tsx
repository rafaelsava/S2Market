import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import React, { useContext } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { AuthContext } from "../context/AuthContext";

export default function Sidebar({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const { profile, logout,orderCount } = useContext(AuthContext);


  const userName = profile?.name || "Usuario";
  const userRole = profile?.role || "Invitado";
  const userPhoto = profile?.photoURL || "https://ui-avatars.com/api/?name=Usuario&background=6C63FF&color=fff&size=128";
  const ordersCount = orderCount || 0;

  return (
    <View style={styles.container}>
      <ScrollView>
        {/* Icono menú o cerrar */}
        <TouchableOpacity onPress={onClose}  style={styles.closeBtn}>
          <Ionicons name="arrow-back" size={28} />
        </TouchableOpacity>

        {/* Info usuario */}
        <View style={styles.userInfo}>
          <Image
            source={{
              uri: userPhoto,
            }}
            style={styles.avatar}
          />
          <Text style={styles.name}>{userName}</Text>
          <Text style={styles.role}>{userRole}</Text>
          <View style={styles.ordersBadge}>
            <Text style={styles.ordersText}>{ordersCount} Orders</Text>
          </View>
        </View>

        {/* Menú */}
        <View style={styles.menu}>
          <MenuItem
            icon="information-circle-outline"
            label="Información de la cuenta"
            onPress={() => router.push("/account-info")}
          />
          <MenuItem
            icon="lock-closed-outline"
            label="Contraseña"
            onPress={() => router.push("/change-password")}
          />
          <MenuItem
            icon="bag-outline"
            label="Órdenes"
            onPress={() => router.push("/orders")}
          />
          <MenuItem
            icon="heart-outline"
            label="Favoritos"
            onPress={() => router.push("/comprador/favoritos")}
          />
          <MenuItem
            icon="cart-outline"
            label="Carrito"
            onPress={() => router.push("/comprador/carrito")}
          />

          {/* Logout */}
          <TouchableOpacity
            onPress={() => {
              logout();
              router.replace("../auth/");
            }}
            style={styles.logout}
          >
            <Ionicons name="log-out-outline" size={20} color="#e74c3c" />
            <Text style={[styles.menuLabel, { color: "#e74c3c" }]}>Logout</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
type IoniconName = keyof typeof Ionicons.glyphMap;

const MenuItem = ({
  icon,
  label,
  onPress,
}: {
  icon: IoniconName;
  label: string;
  onPress: () => void;
}) => (
  <TouchableOpacity style={styles.menuItem} onPress={onPress}>
    <Ionicons name={icon} size={22} color="#333" />
    <Text style={styles.menuLabel}>{label}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: 40,
    paddingHorizontal: 16,
  },
  closeBtn: {
    marginBottom: 20,
  },
  userInfo: {
    alignItems: "center",
    marginBottom: 24,
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    marginBottom: 8,
    backgroundColor: "#ccc",
  },
  name: {
    fontSize: 20,
    fontWeight: "bold",
  },
  role: {
    color: "#888",
    marginBottom: 8,
  },
  ordersBadge: {
    backgroundColor: "#6C63FF",
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  ordersText: {
    color: "#fff",
    fontWeight: "600",
  },
  menu: {
    borderTopWidth: 1,
    borderTopColor: "#eee",
    paddingTop: 12,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  menuLabel: {
    marginLeft: 12,
    fontSize: 16,
  },
  logout: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    marginTop: 30,
  },
});
