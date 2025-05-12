import { useRouter } from 'expo-router';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { getDownloadURL, ref as storageRef } from 'firebase/storage';
import React, { useContext, useEffect, useState } from 'react';
import { FlatList, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { AuthContext } from '../../context/AuthContext';
import { useCurrency } from '../../context/CurrencyContext';
import { db, storage } from '../../utils/FirebaseConfig';
import { OrderCard } from './components/OrderCard';

const DashboardVendor: React.FC = () => {
  const router = useRouter();
  const { currentUser } = useContext(AuthContext);
  const { currency, rates, loading: currencyLoading } = useCurrency();

  const [orders, setOrders] = useState<any[]>([]);
  const [productsCount, setProductsCount] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [salesTotal, setSalesTotal] = useState(0);

  useEffect(() => {
    if (!currentUser) return;
    const fetchData = async () => {
      // Contar productos propios
      const prodQ = query(
        collection(db, 'products'),
        where('vendorId', '==', currentUser.uid)
      );
      const prodSnap = await getDocs(prodQ);
      setProductsCount(prodSnap.size);

      // Cargar pedidos propios
      const orderQ = query(
        collection(db, 'orders'),
        where('vendorId', '==', currentUser.uid)
      );
      const orderSnap = await getDocs(orderQ);
      const fetched: any[] = [];
      let total = 0;

      for (const doc of orderSnap.docs) {
        const data = doc.data() as any;
        const url = await getDownloadURL(storageRef(storage, data.imagePath));
        const raw = data.price;
        total += raw;
        const converted = currencyLoading ? raw : raw * (rates[currency] || 1);

        fetched.push({
          id: doc.id,
          title: data.title,
          status: data.status,
          price: raw,
          priceFormatted: currencyLoading
            ? `${raw}`
            : converted.toLocaleString(undefined, { style: 'currency', currency }),
          imageUrl: url,
        });
      }

      setOrders(fetched);
      setPendingCount(fetched.filter(o => o.status === 'Pendiente').length);
      setSalesTotal(total);
    };
    fetchData();
  }, [currentUser, currency, rates, currencyLoading]);

  if (!currentUser) return null;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Icon name="menu" size={28} />
        <Text style={styles.headerTitle}>Dashboard</Text>
      </View>
      <Text style={styles.subtitle}>Observa tu resumen de ventas</Text>

      {/* Estadísticas */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Icon name="cube-outline" size={24} color="#6c63ff" />
          <Text style={styles.statNumber}>{productsCount}</Text>
          <Text style={styles.statLabel}>Productos</Text>
        </View>
        <View style={[styles.statCard, styles.pendingStat]}>
          <Icon name="clock-outline" size={24} color="#2ecc71" />
          <Text style={styles.statNumber}>{pendingCount}</Text>
          <Text style={styles.statLabel}>Pendientes</Text>
        </View>
        <View style={styles.statCard}>
          <Icon name="cash" size={24} color="#f1c40f" />
          <Text style={styles.statNumber}>
            {currencyLoading
              ? salesTotal
              : (salesTotal * (rates[currency] || 1)).toLocaleString(undefined, { style: 'currency', currency })}
          </Text>
          <Text style={styles.statLabel}>Ventas</Text>
        </View>
      </View>

      {/* Pedidos Recientes */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Pedidos Recientes</Text>
        <TouchableOpacity>
          <Text style={styles.viewAll}>Ver Todo</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={orders}
        keyExtractor={(o) => o.id}
        renderItem={({ item }) => <OrderCard order={item} />}
        contentContainerStyle={styles.orderList}
      />

      {/* Acciones */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => router.push('/vendedor/AddProduct')}
        >
          <Icon name="plus-box-outline" size={24} />
          <View style={styles.actionInfo}>
            <Text style={styles.actionTitle}>Agregar un producto</Text>
            <Text style={styles.actionSubtitle}>Registra un nuevo producto</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => router.push('/')} // Replace with actual route
        >
          <Icon name="clipboard-list-outline" size={24} />
          <View style={styles.actionInfo}>
            <Text style={styles.actionTitle}>Gestionar Pedidos</Text>
            <Text style={styles.actionSubtitle}>Actualiza el estado de pedidos</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <Icon name="home-outline" size={28} />
        <Icon name="heart-outline" size={28} />
        <Icon name="shopping-outline" size={28} />
        <Icon name="account-outline" size={28} />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginLeft: 16,
  },
  subtitle: {
    color: '#555',
    marginTop: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  pendingStat: {
    backgroundColor: '#e8f8f5',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 8,
  },
  statLabel: {
    color: '#777',
    marginTop: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  viewAll: {
    color: '#6c63ff',
  },
  orderList: {
    paddingVertical: 16,
  },
  actionsContainer: {
    marginTop: 24,
  },
  actionCard: {
    flexDirection: 'row',
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  actionInfo: {
    marginLeft: 12,
  },
  actionTitle: {
    fontWeight: 'bold',
  },
  actionSubtitle: {
    color: '#555',
    marginTop: 2,
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderColor: '#eee',
    marginTop: 'auto',
  },
});

export default DashboardVendor;