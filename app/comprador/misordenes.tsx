import { useRouter } from 'expo-router';
import { doc, getDoc } from 'firebase/firestore';
import React, { useContext, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { AuthContext } from '../../context/AuthContext';
import { useCurrency } from '../../context/CurrencyContext';
import { useMyOrders } from '../../context/MyOrderContext';
import { db } from '../../utils/FirebaseConfig';

export default function MyOrdersScreen() {
  const router = useRouter();
  const { currentUser } = useContext(AuthContext);
  const { currency, rates, loading: curLoading } = useCurrency();
  const { orders, loading, fetchOrders } = useMyOrders();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'Todos' | 'pendiente' | 'en camino' | 'entregado'>('Todos');
  const [showDropdown, setShowDropdown] = useState(false);
  const [enrichedOrders, setEnrichedOrders] = useState<any[]>([]);

  const statusOptions: { label: string; value: 'Todos' | 'pendiente' | 'en camino' | 'entregado' }[] = [
    { label: 'Todos', value: 'Todos' },
    { label: 'Pendiente', value: 'pendiente' },
    { label: 'En camino', value: 'en camino' },
    { label: 'Entregado', value: 'entregado' },
  ];

  useEffect(() => {
    if (currentUser) fetchOrders(currentUser.uid);
    console.log('Fetching orders for user:', currentUser?.uid);
    console.log('Orders fetched:', orders);
  }, [currentUser]);

  useEffect(() => {
    const enrich = async () => {
      const list: any[] = [];
      for (const order of orders) {
        let qty = 0, total = 0;
        for (const item of order.items) {
          const pSnap = await getDoc(doc(db, 'products', item.productId));
          const pd = pSnap.data();
          qty += item.quantity;
          total += (pd?.price || 0) * item.quantity;
        }
        const fmt = curLoading
          ? `${total}`
          : (total * (rates[currency] || 1)).toLocaleString(undefined, {
              style: 'currency',
              currency,
            });
        list.push({
          ...order,
          totalQuantity: qty,
          priceFormatted: fmt,
          date: order.createdAt.toDate(),
        });
      }
      setEnrichedOrders(list);
    };
    enrich();
  }, [orders, currency, rates, curLoading]);

  const filtered = enrichedOrders.filter((o) => {
    const okSearch = o.id.includes(search);
    const okStatus = statusFilter === 'Todos' ? true : o.status === statusFilter;
    return okSearch && okStatus;
  });

  if (loading) return <ActivityIndicator style={{ flex: 1 }} size="large" />;

  return (
    <TouchableWithoutFeedback onPress={() => setShowDropdown(false)}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.push('/comprador')}>
            <Icon name="arrow-left" size={28} />
          </TouchableOpacity>
          <Text style={styles.title}>Mis Órdenes</Text>
        </View>
        <TextInput
          style={styles.search}
          placeholder="Buscar por ID..."
          value={search}
          onChangeText={setSearch}
        />

        <View style={styles.control}>
          <TouchableOpacity
            style={styles.controlInner}
            onPress={() => setShowDropdown(!showDropdown)}
          >
            <Text style={styles.controlText}>
              {statusOptions.find((o) => o.value === statusFilter)?.label}
            </Text>
            <Icon name="chevron-down" size={20} />
          </TouchableOpacity>
          {showDropdown && (
            <View style={styles.dropdown}>
              {statusOptions.map((opt) => (
                <TouchableOpacity
                  key={opt.value}
                  style={styles.option}
                  onPress={() => {
                    setStatusFilter(opt.value);
                    setShowDropdown(false);
                  }}
                >
                  <Text style={styles.optionText}>{opt.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.orderId}>Pedido #{item.id.slice(0, 6)}...</Text>
                <Text
                style={[
                    styles.badge,
                    item.status === 'entregado' && styles.badgeEntregado
                ]}
                >
                {item.status}
                </Text>
              </View>
              <Text style={styles.date}>
                {item.date.toLocaleDateString('es-ES', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}{' '}
                -{' '}
                {item.date.toLocaleTimeString('es-CO', {
                  hour: 'numeric',
                  minute: '2-digit',
                })}
              </Text>
              <View style={styles.summary}>
                <Text style={styles.price}>{item.priceFormatted}</Text>
                <Text style={styles.qty}>{item.totalQuantity} productos</Text>
              </View>
            </View>
          )}
        />
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 16, paddingTop: 60 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  title: { fontSize: 20, fontWeight: 'bold', marginLeft: 12 },
  search: {
    backgroundColor: '#f1f1f1',
    borderRadius: 8,
    padding: 8,
    marginBottom: 12,
  },
  control: { marginBottom: 16 },
  controlInner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#fff',
  },
  controlText: { fontSize: 16 },
  dropdown: {
    position: 'absolute',
    top: 48,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    zIndex: 10,
  },
  option: { padding: 12 },
  optionText: { fontSize: 16 },
  card: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    elevation: 2,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between' },
  orderId: { fontWeight: 'bold' },
  badge: { backgroundColor: '#ffecb3', paddingHorizontal: 8, borderRadius: 12 },
    badgeEntregado: {
    backgroundColor: '#D1FAE5'   // verde
  },
  date: { color: '#555', marginTop: 4 },
  summary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  price: { fontWeight: 'bold' },
  qty: { color: '#555' },
  detailsBtn: {
    marginTop: 12,
    backgroundColor: '#6c63ff',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignSelf: 'flex-end',
  },
  detailsText: { color: '#fff' },
});
