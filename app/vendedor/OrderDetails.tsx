// app/vendedor/OrderDetails.tsx
import { Picker } from '@react-native-picker/picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { getDownloadURL, ref as storageRef } from 'firebase/storage';
import React, { useContext, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { AuthContext } from '../../context/AuthContext';
import { db, storage } from '../../utils/FirebaseConfig';

interface OrderItem {
  productId: string;
  quantity: number;
  sellerId: string;
}

interface ProductDetail {
  title: string;
  price: number;
  quantity: number;
  imageUrl: string;
}

export default function OrderDetails() {
  const router = useRouter();
  const { orderId } = useLocalSearchParams() as { orderId: string };
  const { currentUser } = useContext(AuthContext);

  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [itemsDetail, setItemsDetail] = useState<ProductDetail[]>([]);
  const [userInfo, setUserInfo] = useState<any>(null);
  const [orderMeta, setOrderMeta] = useState<any>(null);

  useEffect(() => {
    const load = async () => {
      // 1) Leer la orden
      const oRef = doc(db, 'orders', orderId);
      const oSnap = await getDoc(oRef);
      const data = oSnap.data() as any;
      setOrderMeta(data);
      setStatus(data.status);

      // 2) Filtrar sólo tus ítems
      const vendorItems: OrderItem[] = data.items.filter(
        (it: OrderItem) => it.sellerId === currentUser?.uid
      );

      // 3) Info del cliente
      const uSnap = await getDoc(doc(db, 'users', data.userId));
      setUserInfo(uSnap.data());

      // 4) Detalles de productos
      const dets: ProductDetail[] = await Promise.all(
        vendorItems.map(async (it) => {
          const pSnap = await getDoc(
            doc(db, 'products', it.productId)
          );
          const pd = pSnap.data() as any;
          const img = await getDownloadURL(
            storageRef(storage, pd.image)
          );
          return {
            title: pd.title,
            price: pd.price,
            quantity: it.quantity,
            imageUrl: img,
          };
        })
      );
      setItemsDetail(dets);
      setLoading(false);
    };

    if (currentUser) load();
  }, [orderId, currentUser]);

  const handleUpdate = async () => {
    const oRef = doc(db, 'orders', orderId);
    await updateDoc(oRef, { status });
    // volvemos al listado
    router.push('/vendedor/ManageOrders');
  };

  if (loading || !orderMeta || !userInfo) {
    return <ActivityIndicator style={{ flex: 1 }} size="large" />;
  }

  const created: Date = orderMeta.createdAt.toDate();
  const dateStr = `${created.toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })} a las ${created.toLocaleTimeString('es-CO', {
    hour: 'numeric',
    minute: '2-digit'
  })}`;

  const subtotal = itemsDetail.reduce(
    (sum, i) => sum + i.price * i.quantity,
    0
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16 }}>
      {/* Header con back fijo */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.push('/vendedor/ManageOrders')}
          style={styles.backBtn}
        >
          <Icon name="arrow-left" size={28} />
        </TouchableOpacity>
        <Text style={styles.screenTitle}>Detalles del Pedido</Text>
      </View>

      <Text style={styles.badge}>{status}</Text>
      <Text style={styles.subtitle}>Realizado el {dateStr}</Text>

      {/* Detalles de productos */}
      <View style={styles.card}>
        {itemsDetail.map((it, idx) => (
          <View key={idx} style={styles.itemRow}>
            <Icon name="cube-outline" size={40} />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.itemTitle}>{it.title}</Text>
              <Text style={styles.itemPrice}>
                {it.price.toLocaleString('es-CO', {
                  style: 'currency',
                  currency: 'COP'
                })}
              </Text>
            </View>
            <Text style={styles.itemQty}>x{it.quantity}</Text>
          </View>
        ))}

        <View style={styles.summary}>
          <View style={styles.summaryRow}>
            <Text>Subtotal</Text>
            <Text>
              {subtotal.toLocaleString('es-CO', {
                style: 'currency',
                currency: 'COP'
              })}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text>Envío</Text>
            <Text>$0</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text>Impuestos</Text>
            <Text>$0</Text>
          </View>
          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text>Total</Text>
            <Text>
              {subtotal.toLocaleString('es-CO', {
                style: 'currency',
                currency: 'COP'
              })}
            </Text>
          </View>
        </View>
      </View>

      {/* Seguimiento */}
      <Text style={styles.sectionTitle}>Seguimiento</Text>
      <View style={styles.trackCard}>
        <Icon name="checkmark-circle" size={24} color="#2ecc71" />
        <View style={{ marginLeft: 8 }}>
          <Text style={styles.trackTitle}>Pedido acordado</Text>
          <Text style={styles.trackDate}>{dateStr}</Text>
          <Text>Se ha acordado el punto de encuentro.</Text>
        </View>
      </View>

      {/* Info Cliente */}
      <Text style={styles.sectionTitle}>Información del Cliente</Text>
      <View style={styles.card}>
        <View style={styles.customerRow}>
          <Icon name="account-circle-outline" size={40} />
          <View style={{ marginLeft: 12 }}>
            <Text style={styles.customerName}>{userInfo.name}</Text>
            <Text style={styles.customerSince}>
              Cliente desde{' '}
              {new Date(userInfo.createdAt.toDate()).toLocaleDateString(
                'es-ES',
                { month: 'long', year: 'numeric' }
              )}
            </Text>
            <Text>{userInfo.email}</Text>
            {userInfo.phone && <Text>{userInfo.phone}</Text>}
          </View>
        </View>
        <View style={styles.addressRow}>
          <Text style={styles.label}>Lugar de Encuentro</Text>
          <Text>{orderMeta.meetingPoint}</Text>
        </View>
        <View style={styles.addressRow}>
          <Text style={styles.label}>Método de Pago</Text>
          <Text>{orderMeta.paymentMethod}</Text>
        </View>
      </View>

      {/* Actualizar estado */}
      <Text style={styles.sectionTitle}>Actualizar estado</Text>
      <View style={styles.pickerBox}>
        <Picker selectedValue={status} onValueChange={setStatus}>
          <Picker.Item label="pendiente" value="pendiente" />
          <Picker.Item label="en camino" value="en camino" />
          <Picker.Item label="entregado" value="entregado" />
        </Picker>
      </View>
      <TouchableOpacity style={styles.updateBtn} onPress={handleUpdate}>
        <Text style={styles.updateText}>Actualizar Pedido</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 8
  },
  backBtn: { marginLeft: 8, marginRight: 12 },
  screenTitle: { fontSize: 20, fontWeight: 'bold' },
  badge: {
    alignSelf: 'center',
    backgroundColor: '#ffecb3',
    paddingHorizontal: 12,
    borderRadius: 12,
    marginVertical: 8
  },
  subtitle: { textAlign: 'center', color: '#555', marginBottom: 16 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    elevation: 2
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12
  },
  itemTitle: { fontWeight: '600' },
  itemPrice: { marginTop: 4 },
  itemQty: { fontWeight: 'bold' },
  summary: { borderTopWidth: 1, borderTopColor: '#eee', paddingTop: 12 },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4
  },
  totalRow: {
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#ccc',
    paddingTop: 4
  },
  sectionTitle: { fontSize: 18, fontWeight: '600', marginBottom: 8 },
  trackCard: {
    flexDirection: 'row',
    backgroundColor: '#e8f8f5',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16
  },
  trackTitle: { fontWeight: '600' },
  trackDate: { color: '#555', fontSize: 12 },
  customerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12
  },
  customerName: { fontWeight: '600' },
  customerSince: { color: '#777' },
  addressRow: { marginBottom: 12 },
  label: { fontWeight: '600' },
  pickerBox: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 16
  },
  updateBtn: {
    backgroundColor: '#6c63ff',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center'
  },
  updateText: { color: '#fff', fontWeight: '600' }
});
