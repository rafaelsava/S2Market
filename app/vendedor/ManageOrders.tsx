// /app/vendedor/ManageProducts.tsx

import { useRouter } from 'expo-router'
import React, { useContext, useEffect, useState } from 'react'
import {
  ActivityIndicator,
  FlatList,
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import { AuthContext } from '../../context/AuthContext'
import { Product, useProducts } from '../../context/ProductContext'

export default function ManageProducts() {
  const router = useRouter()
  const { currentUser } = useContext(AuthContext)
  const { products, loading, error } = useProducts()
  const [filtered, setFiltered] = useState<Product[]>([])
  const [search, setSearch] = useState('')

  // Cada vez que cambian products o search, filtramos
  useEffect(() => {
    if (!currentUser) return
    let vendProducts = products.filter(
      p => p.sellerId === currentUser.uid
    )
    if (search.trim()) {
      vendProducts = vendProducts.filter(p =>
        p.title.toLowerCase().includes(search.toLowerCase())
      )
    }
    setFiltered(vendProducts)
  }, [products, search, currentUser])

  if (loading) {
    return (
      <SafeAreaView style={styles.loader}>
        <ActivityIndicator size="large" />
      </SafeAreaView>
    )
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>Error: {error}</Text>
      </SafeAreaView>
    )
  }

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

      {/* Lista de Productos */}
      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => <ProductCardVendedor product={item} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>
              No tienes productos{search ? ' que coincidan con la búsqueda' : ''}.
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  )
}

const ProductCardVendedor: React.FC<{ product: Product }> = ({ product }) => (
  <View style={styles.card}>
    {/* Imagen */}
    <Image source={{ uri: product.image }} style={styles.image} />

    {/* Info */}
    <View style={styles.info}>
      <Text style={styles.productTitle}>{product.title}</Text>
      <Text style={styles.category}>{product.category}</Text>
      <Text style={styles.price}>${product.price.toFixed(2)}</Text>
      <Text style={styles.stock}>Stock: {product.stock}</Text>
    </View>

    {/* Botones */}
    <View style={styles.actions}>
      <TouchableOpacity style={styles.btnEdit}>
        <Icon name="pencil-outline" size={20} color="#FFF" />
      </TouchableOpacity>
      <TouchableOpacity style={styles.btnDelete}>
        <Icon name="delete-outline" size={20} color="#FFF" />
      </TouchableOpacity>
    </View>
  </View>
)

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF', padding: 16 },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: { color: 'red', textAlign: 'center' },

  header: { flexDirection: 'row', alignItems: 'center' },
  title: { fontSize: 20, fontWeight: 'bold', marginLeft: 12 },

  searchWrapper: {
    flexDirection: 'row',
    backgroundColor: '#F9F9F9',
    borderRadius: 8,
    paddingHorizontal: 12,
    alignItems: 'center',
    marginTop: 24,
    height: 40,
  },
  searchInput: { flex: 1, marginLeft: 8 },

  list: { paddingVertical: 16 },

  card: {
    flexDirection: 'row',
    backgroundColor: '#F9F9F9',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
  },
  image: {
    width: 100,
    height: 100,
  },
  info: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  productTitle: { fontWeight: '600', fontSize: 16 },
  category: { color: '#777', fontSize: 13 },
  price: { fontWeight: 'bold', fontSize: 16 },
  stock: { color: '#555', fontSize: 14 },

  actions: {
    justifyContent: 'space-around',
    padding: 8,
  },
  btnEdit: {
    backgroundColor: '#6C63FF',
    padding: 8,
    borderRadius: 8,
  },
  btnDelete: {
    backgroundColor: '#EF4444',
    padding: 8,
    borderRadius: 8,
  },
  empty: { marginTop: 40, alignItems: 'center' },
  emptyText: { color: '#777' },
})
