// app/comprador/OrderDetails.tsx
import { useLocalSearchParams, useRouter } from 'expo-router';
import { doc, getDoc } from 'firebase/firestore';
import { getDownloadURL, ref as storageRef } from 'firebase/storage';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
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
  const { orderId } = useLocalSearchParams<{ orderId: string }>();  // ← corregido
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [orderMeta, setOrderMeta] = useState<any>(null);
  const [itemsDetail, setItemsDetail] = useState<ProductDetail[]>([]);
  const [sellerInfo, setSellerInfo] = useState<any>(null);

  useEffect(() => {
    async function loadOrder() {
      try {
        // 1) Leer la orden
        const oSnap = await getDoc(doc(db, 'orders', orderId));
        if (!oSnap.exists()) throw new Error('Orden no encontrada');
        const data = oSnap.data() as any;
        setOrderMeta(data);

        // 2) Detalles de los productos
        const dets: ProductDetail[] = await Promise.all(
          data.items.map(async (it: OrderItem) => {
            const pSnap = await getDoc(doc(db, 'products', it.productId));
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

        // 3) Información del VENDEDOR (primer ítem)
        const firstSellerId: string = data.items[0]?.sellerId;
        if (firstSellerId) {
          const sSnap = await getDoc(doc(db, 'users', firstSellerId));
          setSellerInfo(sSnap.data());
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadOrder();
  }, [orderId]);

  if (loading || !orderMeta) {
    return <ActivityIndicator style={{ flex: 1 }} size="large" />;
  }

  // Formatear fecha
  const created: Date = orderMeta.createdAt.toDate();
  const dateStr = `${created.toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })} a las ${created.toLocaleTimeString('es-CO', {
    hour: 'numeric',
    minute: '2-digit',
  })}`;

  // Subtotal
  const subtotal = itemsDetail.reduce(
    (sum, i) => sum + i.price * i.quantity,
    0
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16 }}>
      {/* Header */}
      <View style={styles.header}>
        <Icon
          name="arrow-left"
          size={28}
          onPress={() => router.back()}
          style={styles.backIcon}
        />
        <Text style={styles.screenTitle}>Detalles del Pedido</Text>
      </View>

      {/* Estado y fecha */}
                <Text
                style={[
                    styles.badge,
                    orderMeta.status === 'entregado' && styles.badgeEntregado
                ]}
                >
                {orderMeta.status}
                </Text>
      <Text style={styles.subtitle}>Realizado el {dateStr}</Text>

      {/* Productos */}
      <View style={styles.card}>
        {itemsDetail.map((it, idx) => (
          <View key={idx} style={styles.itemRow}>
            <Icon name="cube-outline" size={40} />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.itemTitle}>{it.title}</Text>
              <Text style={styles.itemPrice}>
                {it.price.toLocaleString('es-CO', {
                  style: 'currency',
                  currency: 'COP',
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
                currency: 'COP',
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
                currency: 'COP',
              })}
            </Text>
          </View>
        </View>
      </View>

      {/* Info Vendedor */}
      {sellerInfo && (
        <>
          <Text style={styles.sectionTitle}>Información del Vendedor</Text>
          <View style={styles.card}>
            <View style={styles.customerRow}>
              <Icon name="account-circle-outline" size={40} />
              <View style={{ marginLeft: 12 }}>
                <Text style={styles.customerName}>{sellerInfo.name}</Text>
                <Text style={styles.customerSince}>
                  Vendedor desde{' '}
                  {new Date(sellerInfo.createdAt.toDate()).toLocaleDateString(
                    'es-ES',
                    { month: 'long', year: 'numeric' }
                  )}
                </Text>
                <Text>{sellerInfo.email}</Text>
                {sellerInfo.phone && <Text>{sellerInfo.phone}</Text>}
              </View>
            </View>
          </View>
        </>
      )}

      {/* Detalles extras de la orden */}
      <Text style={styles.sectionTitle}>Detalles de la Orden</Text>
      <View style={styles.card}>
        <View style={styles.addressRow}>
          <Text style={styles.label}>Punto de Encuentro</Text>
          <Text>{orderMeta.meetingPoint}</Text>
        </View>
        <View style={styles.addressRow}>
          <Text style={styles.label}>Método de Pago</Text>
          <Text>{orderMeta.paymentMethod}</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { flexDirection: 'row', alignItems: 'center', marginTop: 50, marginBottom: 8 },
  backIcon: { marginLeft: 8, marginRight: 12 },
  screenTitle: { fontSize: 20, fontWeight: 'bold' },
  badge: {
    alignSelf: 'center',
    backgroundColor: '#ffecb3',
    paddingHorizontal: 12,
    borderRadius: 12,
    marginVertical: 8,
  },
  subtitle: { textAlign: 'center', color: '#555', marginBottom: 16 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
  },
  itemRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  itemTitle: { fontWeight: '600' },
  itemPrice: { marginTop: 4 },
  itemQty: { fontWeight: 'bold' },
  summary: { borderTopWidth: 1, borderTopColor: '#eee', paddingTop: 12 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  totalRow: {
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#ccc',
    paddingTop: 4,
  },
  sectionTitle: { fontSize: 18, fontWeight: '600', marginBottom: 8 },
  customerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  customerName: { fontWeight: '600' },
  customerSince: { color: '#777' },
  addressRow: { marginBottom: 12 },
  label: { fontWeight: '600' },
      badgeEntregado: {
    backgroundColor: '#D1FAE5'   // verde
  }
});
