// app/vendedor/ManageOrders.tsx
import { useRouter } from 'expo-router';
import { collection, doc, getDoc, getDocs } from 'firebase/firestore';
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
import { db } from '../../utils/FirebaseConfig';

interface OrderItem { productId: string; quantity: number; sellerId: string; }
interface OrderData { userId: string; items: OrderItem[]; status: string; createdAt: any; }
interface EnrichedOrder { id: string; date: Date; status: string; totalQuantity: number; priceFormatted: string; customerName: string; }

export default function ManageOrders() {
  const router = useRouter();
  const { currentUser } = useContext(AuthContext);
  const { currency, rates, loading: curLoading } = useCurrency();

  const [orders, setOrders] = useState<EnrichedOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'Todos'|'pendiente'|'en camino'|'entregado'>('Todos');
  const [quantitySort, setQuantitySort] = useState<'asc'|'desc'>('desc');
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showQuantityDropdown, setShowQuantityDropdown] = useState(false);

  const statusOptions: { label: string; value: typeof statusFilter }[] = [
    { label: 'Todos', value: 'Todos' },
    { label: 'Pendiente', value: 'pendiente' },
    { label: 'En camino', value: 'en camino' },
    { label: 'Entregado', value: 'entregado' },
  ];
  const quantityOptions: { label: string; value: typeof quantitySort }[] = [
    { label: 'Cantidad ↓', value: 'desc' },
    { label: 'Cantidad ↑', value: 'asc' },
  ];

  useEffect(() => {
    (async () => {
      if (!currentUser) return;
      setLoading(true);
      try {
        const snap = await getDocs(collection(db, 'orders'));
        const list: EnrichedOrder[] = [];
        for (const d of snap.docs) {
          const o = d.data() as OrderData;
          const myItems = o.items.filter(i => i.sellerId === currentUser.uid);
          if (!myItems.length) continue;
          let qty=0, total=0;
          for (const it of myItems) {
            const pSnap = await getDoc(doc(db,'products',it.productId));
            const pd = pSnap.data() as any;
            qty += it.quantity;
            total += (pd.price||0)*it.quantity;
          }
          const fmt = curLoading
            ? `${total}`
            : (total*(rates[currency]||1)).toLocaleString(undefined,{style:'currency',currency});
          const uSnap = await getDoc(doc(db,'users',o.userId));
          const user = uSnap.data() as any;
          list.push({ id:d.id, date:o.createdAt.toDate(), status:o.status, totalQuantity:qty, priceFormatted:fmt, customerName:user.name });
        }
        setOrders(list);
      } catch(e) { console.error(e); }
      finally { setLoading(false); }
    })();
  },[currentUser,curLoading,rates,currency]);

  const filtered = orders.filter(o => {
    const okSearch = o.customerName.toLowerCase().includes(search.toLowerCase()) || o.id.includes(search);
    const okStatus = statusFilter==='Todos' ? true : o.status===statusFilter;
    return okSearch && okStatus;
  });
  const sorted = [...filtered].sort((a,b) => quantitySort==='asc' ? a.totalQuantity-b.totalQuantity : b.totalQuantity-a.totalQuantity);

  if(loading) return <ActivityIndicator style={{flex:1}} size="large" />;

  return (
    <TouchableWithoutFeedback onPress={()=>{ setShowStatusDropdown(false); setShowQuantityDropdown(false); }}>
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={()=>router.back()}><Icon name="arrow-left" size={28}/></TouchableOpacity>
        <Text style={styles.title}>Gestión de Pedidos</Text>
      </View>
      <TextInput style={styles.search} placeholder="Buscar Pedidos..." value={search} onChangeText={setSearch}/>

      <View style={styles.filtersRow}>
        <View style={styles.control}>
          <TouchableOpacity style={styles.controlInner} onPress={()=>{ setShowStatusDropdown(!showStatusDropdown); setShowQuantityDropdown(false); }}>
            <Text style={styles.controlText}>{statusOptions.find(o=>o.value===statusFilter)?.label}</Text>
            <Icon name="chevron-down" size={20} />
          </TouchableOpacity>
          {showStatusDropdown && <View style={styles.dropdown}>
            {statusOptions.map(opt=> (
              <TouchableOpacity key={opt.value} style={styles.option} onPress={()=>{ setStatusFilter(opt.value); setShowStatusDropdown(false); }}>
                <Text style={styles.optionText}>{opt.label}</Text>
              </TouchableOpacity>
            ))}
          </View>}
        </View>

        <View style={styles.control}>
          <TouchableOpacity style={styles.controlInner} onPress={()=>{ setShowQuantityDropdown(!showQuantityDropdown); setShowStatusDropdown(false); }}>
            <Text style={styles.controlText}>{quantityOptions.find(o=>o.value===quantitySort)?.label}</Text>
            <Icon name="chevron-down" size={20} />
          </TouchableOpacity>
          {showQuantityDropdown && <View style={styles.dropdown}>
            {quantityOptions.map(opt=> (
              <TouchableOpacity key={opt.value} style={styles.option} onPress={()=>{ setQuantitySort(opt.value); setShowQuantityDropdown(false); }}>
                <Text style={styles.optionText}>{opt.label}</Text>
              </TouchableOpacity>
            ))}
          </View>}
        </View>
      </View>

      <FlatList data={sorted} keyExtractor={i=>i.id} renderItem={({item})=>(
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.orderId}>Pedido de {item.customerName}</Text>
            <Text style={styles.badge}>{item.status}</Text>
          </View>
          <Text style={styles.date}>{item.date.toLocaleDateString('es-ES',{day:'numeric',month:'long',year:'numeric'})} - {item.date.toLocaleTimeString('es-CO',{hour:'numeric',minute:'2-digit'})}</Text>
          <View style={styles.summary}>
            <Text style={styles.price}>{item.priceFormatted}</Text>
            <Text style={styles.qty}>{item.totalQuantity} productos</Text>
          </View>
          <TouchableOpacity style={styles.detailsBtn} onPress={()=>router.push(`/vendedor/OrderDetails?orderId=${item.id}`)}>
            <Text style={styles.detailsText}>Ver Detalles</Text>
          </TouchableOpacity>
        </View>
      )}/>
    </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container:{flex:1,backgroundColor:'#fff',padding:16,paddingTop:60},
  header:{flexDirection:'row',alignItems:'center',marginBottom:12},
  title:{fontSize:20,fontWeight:'bold',marginLeft:12},
  search:{backgroundColor:'#f1f1f1',borderRadius:8,padding:8,marginBottom:12},
  filtersRow:{flexDirection:'row',marginBottom:16},
  control:{flex:1,marginRight:8},
  controlInner:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',borderWidth:1,borderColor:'#ccc',borderRadius:8,paddingHorizontal:12,paddingVertical:8,backgroundColor:'#fff'},
  controlText:{fontSize:16},
  dropdown:{position:'absolute',top:48,left:0,right:0,backgroundColor:'#fff',borderWidth:1,borderColor:'#ccc',borderRadius:8,zIndex:10},
  option:{padding:12},
  optionText:{fontSize:16},
  card:{backgroundColor:'#fff',padding:12,borderRadius:8,marginBottom:12,elevation:2},
  cardHeader:{flexDirection:'row',justifyContent:'space-between'},
  orderId:{fontWeight:'bold'},
  badge:{backgroundColor:'#ffecb3',paddingHorizontal:8,borderRadius:12},
  date:{color:'#555',marginTop:4},
  summary:{flexDirection:'row',justifyContent:'space-between',marginTop:8},
  price:{fontWeight:'bold'},
  qty:{color:'#555'},
  detailsBtn:{marginTop:12,backgroundColor:'#6c63ff',paddingVertical:6,paddingHorizontal:12,borderRadius:6,alignSelf:'flex-end'},
  detailsText:{color:'#fff'},
});
