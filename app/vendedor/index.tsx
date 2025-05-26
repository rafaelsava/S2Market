// app/vendedor/index.tsx

import SidebarVendedor from '@/components/sidebarVendedor';
import { useRouter } from 'expo-router';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where
} from 'firebase/firestore';
import { getDownloadURL, ref as storageRef } from 'firebase/storage';
import React, { useContext, useEffect, useState } from 'react';
import {
  FlatList,
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import Modal from 'react-native-modal';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { AuthContext } from '../../context/AuthContext';
import { useCurrency } from '../../context/CurrencyContext';
import { useOrderNotifications } from '../../hooks/useOrderNotifications';
import { db, storage } from '../../utils/FirebaseConfig';

interface OrderItem {
  productId: string;
  quantity: number;
  sellerId: string;
}
interface OrderData {
  userId: string;
  items: OrderItem[];
  status: string;
  createdAt: any;
}
interface VendorOrder {
  id: string;
  date: Date;
  title: string;
  subtitle: string;
  status: string;
  imageUrl: string;
}

export default function DashboardVendor() {
  useOrderNotifications();
  const router = useRouter();
  const { currentUser } = useContext(AuthContext);
  const { currency, rates, loading: currencyLoading } = useCurrency();

  const [productsCount, setProductsCount] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [salesTotal, setSalesTotal] = useState(0);
  const [recentOrders, setRecentOrders] = useState<VendorOrder[]>([]);
  const [sidebarVisible, setSidebarVisible] = useState(false);

  useEffect(() => {
    if (!currentUser) return;
    const fetchData = async () => {
      // Products count
      const prodSnap = await getDocs(
        query(
          collection(db, 'products'),
          where('sellerId', '==', currentUser.uid)
        )
      );
      setProductsCount(prodSnap.size);

      // Orders
      const orderSnap = await getDocs(collection(db, 'orders'));
      let pend = 0;
      let totalSalesAccum = 0;
      const list: VendorOrder[] = [];

      for (const docSnap of orderSnap.docs) {
        const o = docSnap.data() as OrderData;
        const myItems = o.items.filter(i => i.sellerId === currentUser.uid);
        if (!myItems.length) continue;

        // order total for this vendor
        let orderSum = 0;
        for (const it of myItems) {
          const pdRef = doc(db, 'products', it.productId);
          const pdSnap = await getDoc(pdRef);
          const pdData = pdSnap.data() as any;
          orderSum += (pdData.price || 0) * it.quantity;
        }

        // count pending
        if (o.status === 'pendiente') pend++;
        // accumulate completed sales
        if (o.status === 'entregado') totalSalesAccum += orderSum;

        // fetch customer name
        const userRef = doc(db, 'users', o.userId);
        const userSnap = await getDoc(userRef);
        const userData = userSnap.data() as any;
        const customerName = userData?.name || 'Cliente';

        // prepare recent
        const first = myItems[0];
        const prodRef2 = doc(db, 'products', first.productId);
        const pdSnap2 = await getDoc(prodRef2);
        const pd2 = pdSnap2.data() as any;
        const imgUrl = await getDownloadURL(
          storageRef(storage, pd2.image)
        );

        list.push({
          id: docSnap.id,
          date: o.createdAt.toDate(),
          title: `Pedido de ${customerName}`,
          subtitle: `${myItems.length} ${pd2.title} – ${
            currencyLoading
              ? orderSum
              : (orderSum * (rates[currency] || 1)).toLocaleString(undefined, {
                  style: 'currency',
                  currency
                })
          }`,
          status: o.status,
          imageUrl: imgUrl,
        });
      }

      setPendingCount(pend);
      setSalesTotal(
        currencyLoading
          ? totalSalesAccum
          : totalSalesAccum * (rates[currency] || 1)
      );

      // sort by date desc, take 3
      const sorted = list.sort(
        (a, b) => b.date.getTime() - a.date.getTime()
      );
      setRecentOrders(sorted.slice(0, 3));
    };
    fetchData();
  }, [currentUser, currency, rates, currencyLoading]);

  return (
    <SafeAreaView style={styles.container}>
      {/* Sidebar Modal */}
      <Modal
        isVisible={sidebarVisible}
        animationIn="slideInLeft"
        animationOut="slideOutLeft"
        backdropOpacity={0.5}
        onBackdropPress={() => setSidebarVisible(false)}
        style={styles.modal}
      >
        <View style={styles.sidebarWrapper}>
          <SidebarVendedor onClose={() => setSidebarVisible(false)} />
        </View>
      </Modal>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setSidebarVisible(true)}>
          <Icon name="menu" size={28} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Dashboard</Text>
      </View>
      <Text style={styles.subheader}>Observa tu resumen de ventas</Text>

      {/* Stats */}
      <View style={styles.statsRow}>
        <View style={[styles.statCard, { backgroundColor: '#F3E8FF' }]}>
          <Icon name="cube-outline" size={24} color="#6C63FF" />
          <Text style={styles.statNumber}>{productsCount}</Text>
          <Text style={styles.statLabel}>Productos</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: '#D1FAE5' }]}>
          <Icon name="cart-outline" size={24} color="#10B981" />
          <Text style={styles.statNumber}>{pendingCount}</Text>
          <Text style={styles.statLabel}>Pendientes</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: '#FEF3C7' }]}>
          <Icon name="cash" size={24} color="#F59E0B" />
          <Text style={styles.statNumber}>
            {currencyLoading
              ? salesTotal
              : salesTotal.toLocaleString(undefined, {
                  style: 'currency',
                  currency
                })}
          </Text>
          <Text style={styles.statLabel}>Ventas</Text>
        </View>
      </View>

      {/* Recent Orders */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Pedidos Recientes</Text>
        <TouchableOpacity onPress={() => router.push('/vendedor/ManageOrders')}>
          <Text style={styles.viewAll}>Ver Todo</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={recentOrders}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.orderCard}>
            <Image source={{ uri: item.imageUrl }} style={styles.orderImage} />
            <View style={styles.orderInfo}>
              <Text style={styles.orderTitle}>{item.title}</Text>
              <Text style={styles.orderSubtitle}>{item.subtitle}</Text>
            </View>
            <View
              style={[
                styles.badge,
                item.status === 'pendiente'
                  ? { backgroundColor: '#FEF3C7' }
                  : { backgroundColor: '#D1FAE5' }
              ]}
            >
              <Text
                style={[
                  styles.badgeText,
                  item.status === 'pendiente'
                    ? { color: '#92400E' }
                    : { color: '#065F46' }
                ]}
              >
                {item.status.charAt(0).toUpperCase() +
                  item.status.slice(1)}
              </Text>
            </View>
          </View>
        )}
      />

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.actionCard, { backgroundColor: '#E0E7FF' }]}
          onPress={() => router.push('/vendedor/AddProduct')}
        >
          <Icon name="plus-box-outline" size={24} color="#6C63FF" />
          <View style={styles.actionText}>
            <Text style={styles.actionTitle}>Agregar un producto</Text>
            <Text style={styles.actionSubtitle}>
              Registra un nuevo producto para vender
            </Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionCard, { backgroundColor: '#DCFCE7' }]}
          onPress={() => router.push('/vendedor/ManageOrders')}
        >
          <Icon name="clipboard-list-outline" size={24} color="#10B981" />
          <View style={styles.actionText}>
            <Text style={styles.actionTitle}>Gestionar Pedidos</Text>
            <Text style={styles.actionSubtitle}>
              Revisa y actualiza el estado de tus pedidos
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  modal: {
    margin: 0,
    justifyContent: 'flex-start',
    alignItems: 'flex-start'
  },
  sidebarWrapper: {
    width: '80%',
    height: '100%',
    backgroundColor: '#fff'
  },
  header: { flexDirection: 'row', alignItems: 'center', padding: 16 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', marginLeft: 16 },
  subheader: {
    color: '#555',
    paddingHorizontal: 16,
    marginBottom: 16
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 24
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: 10,
    borderRadius: 12,
    marginHorizontal: 4
  },
  statNumber: { fontSize: 15, fontWeight: 'bold', marginTop: 8 },
  statLabel: { color: '#555', marginTop: 4 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12
  },
  sectionTitle: { fontSize: 18, fontWeight: '600' },
  viewAll: { color: '#6C63FF' },
  orderCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginHorizontal: 16,
    marginBottom: 12,
    elevation: 2,
    alignItems: 'center'
  },
  orderImage: { width: 60, height: 60, borderRadius: 8, marginRight: 12 },
  orderInfo: { flex: 1 },
  orderTitle: { fontWeight: 'bold', fontSize: 16 },
  orderSubtitle: { color: '#555', marginTop: 4 },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  badgeText: { fontSize: 12, fontWeight: '600' },
  actions: { paddingHorizontal: 16, marginTop: 24 },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12
  },
  actionText: { marginLeft: 12 },
  actionTitle: { fontWeight: '600', fontSize: 16 },
  actionSubtitle: { color: '#555', marginTop: 4 }
});
