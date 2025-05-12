import { Picker } from '@react-native-picker/picker';
import React, { useContext, useState } from 'react';
import {
  Alert,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import CameraModal from '../../components/CameraModal';
import { AuthContext } from '../../context/AuthContext';
import { Category, useProducts } from '../../context/ProductContext';

const categories: Category[] = [
  'Tecnología',
  'Libros',
  'Ropa',
  'Hogar',
  'Papelería',
  'Deportes',
  'Arte',
  'Musica',
  'Alimentos',
  'Otros'
];
const AddProduct: React.FC = () => {
  const { addProduct } = useProducts();
  const { currentUser } = useContext(AuthContext);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<Category>(categories[0]);
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [imageUri, setImageUri] = useState('');
  const [modalVisible, setModalVisible] = useState(false);

  const handleSave = async () => {

    console.log("🧪 Imagen URI capturada:", imageUri); // 👈

    if (!title || !description || !price || !stock || !imageUri) {
      return Alert.alert('Error', 'Todos los campos son obligatorios');
    }

    try {
      if (!currentUser?.uid) throw new Error('Usuario no autenticado');

      await addProduct({
        title,
        description,
        category,
        price: parseFloat(price),
        stock: parseInt(stock, 10),
        image: imageUri, // ya es downloadURL
        sellerId: currentUser.uid,
      });

      Alert.alert('Éxito', 'Producto agregado');
    } catch (e: any) {
      Alert.alert('Error', e.message);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.form}>
        <TouchableOpacity onPress={() => history.back()} style={styles.backButton}>
          <Icon name="arrow-left" size={28} />
        </TouchableOpacity>
        <Text style={styles.header}>Nuevo Producto</Text>

        <Text style={styles.label}>Nombre</Text>
        <TextInput style={styles.input} value={title} onChangeText={setTitle} placeholder="Ej: Brownies" />

        <Text style={styles.label}>Descripción</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={description}
          onChangeText={setDescription}
          placeholder="Describe tu producto..."
          multiline
        />

        <Text style={styles.label}>Categoría</Text>
        <View style={styles.pickerBox}>
          <Picker selectedValue={category} onValueChange={setCategory}>
            {categories.map(c => <Picker.Item key={c} label={c} value={c} />)}
          </Picker>
        </View>

        <Text style={styles.label}>Imagen</Text>
        <TouchableOpacity style={styles.imageBox} onPress={() => setModalVisible(true)}>
          {imageUri
            ? <Image source={{ uri: imageUri }} style={styles.image} />
            : <View style={styles.placeholder}><Icon name="camera" size={32} /><Text>Capturar/Seleccionar</Text></View>
          }
        </TouchableOpacity>

        <View style={styles.row}>
          <View style={styles.half}>
            <Text style={styles.label}>Precio</Text>
            <TextInput
              style={styles.input}
              value={price}
              onChangeText={setPrice}
              placeholder="Ej: 3500"
              keyboardType="numeric"
            />
          </View>
          <View style={styles.half}>
            <Text style={styles.label}>Stock</Text>
            <TextInput
              style={styles.input}
              value={stock}
              onChangeText={setStock}
              placeholder="Ej: 50"
              keyboardType="numeric"
            />
          </View>
        </View>

        <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
          <Text style={styles.saveText}>Guardar Producto</Text>
        </TouchableOpacity>
      </ScrollView>

      <CameraModal
        isVisible={modalVisible}
        onClose={() => setModalVisible(false)}
        onCapture={setImageUri}
      />
    </SafeAreaView>
  );
};

export default AddProduct;
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  form: { padding: 16 },
  backButton: { marginBottom: 16 },
  header: { fontSize: 20, fontWeight: 'bold', marginBottom: 24 },
  label: { fontWeight: '600', marginBottom: 8 },
  input: { backgroundColor: '#f9f9f9', borderRadius: 8, padding: 12, marginBottom: 16 },
  textArea: { height: 100, textAlignVertical: 'top' },
  pickerBox: { backgroundColor: '#f9f9f9', borderRadius: 8, marginBottom: 16 },
  imageBox: { backgroundColor: '#f9f9f9', borderRadius: 8, height: 200, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  placeholder: { justifyContent: 'center', alignItems: 'center' },
  image: { width: '100%', height: '100%', borderRadius: 8 },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  half: { width: '48%' },
  saveBtn: { backgroundColor: '#3b82f6', padding: 16, borderRadius: 8, alignItems: 'center', marginTop: 24 },
  saveText: { color: '#fff', fontWeight: '600' },
});