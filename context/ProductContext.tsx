import * as FileSystem from 'expo-file-system';
import { addDoc, collection, getDocs, serverTimestamp } from 'firebase/firestore';
import { getDownloadURL, ref as storageRef, uploadBytes } from 'firebase/storage';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { db, storage } from '../utils/FirebaseConfig';
import { AuthContext } from './AuthContext';

export type Category = 'Ropa' | 'Hogar' | 'Alimentos' | 'Utilidades' | 'Deportes';

export interface Product {
  id: string;
  title: string;
  description: string;
  category: Category;
  imageUrl: string;
  price: number;
  stock: number;
  vendorId: string;
  vendorName: string;
  createdAt: any;
}

interface ProductContextType {
  products: Product[];
  loading: boolean;
  error: string | null;
  addProduct: (data: Omit<Product, 'id' | 'vendorId' | 'vendorName' | 'createdAt'> & { imageUri: string }) => Promise<void>;
}

export const ProductContext = createContext<ProductContextType>({} as any);
export const useProductsContext = () => useContext(ProductContext);

export const ProductProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useContext(AuthContext);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = async () => {
    try {
      const snap = await getDocs(collection(db, 'products'));
      const data = snap.docs.map(doc => ({ id: doc.id, ...(doc.data() as any) } as Product));
      setProducts(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProducts(); }, []);

  const addProduct = async ({ title, description, category, price, stock, imageUri }: any) => {
    if (!currentUser) throw new Error('Usuario no autenticado');
    let downloadUrl: string;
    // Determinar si es URI local o URL remota
    if (imageUri.startsWith('file://')) {
      // Leer local como base64
      const base64 = await FileSystem.readAsStringAsync(imageUri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      const blob = new Blob([Uint8Array.from(atob(base64), c => c.charCodeAt(0))], { type: 'image/jpeg' });
      const path = `products/${currentUser.uid}/${Date.now()}`;
      const imgRef = storageRef(storage, path);
      await uploadBytes(imgRef, blob);
      downloadUrl = await getDownloadURL(imgRef);
    } else {
      // Ya es URL remota, no subimos de nuevo
      downloadUrl = imageUri;
    }

    // Guardar documento en Firestore
    await addDoc(collection(db, 'products'), {
      title,
      description,
      category,
      price,
      stock,
      imageUrl: downloadUrl,
      vendorId: currentUser.uid,
      vendorName: currentUser.displayName || '',
      createdAt: serverTimestamp(),
    });
    await fetchProducts();
  };

  return (
    <ProductContext.Provider value={{ products, loading, error, addProduct }}>
      {children}
    </ProductContext.Provider>
  );
}