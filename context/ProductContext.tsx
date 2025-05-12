import * as FileSystem from 'expo-file-system';
import { addDoc, collection, getDocs, orderBy, query, serverTimestamp } from 'firebase/firestore';
import { getDownloadURL, ref as storageRef, uploadBytes } from 'firebase/storage';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { db, storage } from '../utils/FirebaseConfig';
import { AuthContext } from './AuthContext';

// ==== Tipos ==== 
export type Category =
  | 'Tecnología'
  | 'Libros'
  | 'Ropa'
  | 'Hogar'
  | 'Papelería'
  | 'Deportes'
  | 'Arte'
  | 'Musica'
  | 'Alimentos'
  | 'Otros';

export interface Review {
  id: string;
  userId: string;
  name: string;
  rating: number;
  comment: string;
  createdAt: any;
}

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
  reviews: Review[];
}

interface ProductContextType {
  products: Product[];
  loading: boolean;
  error: string | null;
  addProduct: (
    data: Omit<Product, 'id' | 'vendorId' | 'vendorName' | 'createdAt' | 'reviews'> & { imageUri: string }
  ) => Promise<void>;
  addReview: (
    productId: string,
    review: Omit<Review, 'id' | 'createdAt'>
  ) => Promise<void>;
}

export const ProductContext = createContext<ProductContextType>({} as any);
export const useProductsContext = () => useContext(ProductContext);

export const ProductProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useContext(AuthContext);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = async () => {
    try {
      const snapshot = await getDocs(collection(db, 'products'));
      const data: Product[] = [];

      for (const doc of snapshot.docs) {
        const p = doc.data() as any;
        // Obtener URL de imagen
        const imgUrl = await getDownloadURL(storageRef(storage, p.imageUrl));
        // Obtener reviews
        const reviewsSnap = await getDocs(
          query(
            collection(db, 'products', doc.id, 'reviews'),
            orderBy('createdAt', 'desc')
          )
        );
        const reviews: Review[] = reviewsSnap.docs.map(r => ({ id: r.id, ...(r.data() as any) })) as Review[];

        data.push({
          id: doc.id,
          title: p.title,
          description: p.description,
          category: p.category,
          imageUrl: imgUrl,
          price: p.price,
          stock: p.stock,
          vendorId: p.vendorId,
          vendorName: p.vendorName,
          createdAt: p.createdAt,
          reviews,
        });
      }
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
    // Si URI local, subir; si no, usar tal cual
    if (imageUri.startsWith('file://')) {
      const base64 = await FileSystem.readAsStringAsync(imageUri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      const blob = new Blob([Uint8Array.from(atob(base64), c => c.charCodeAt(0))], { type: 'image/jpeg' });
      const path = `products/${currentUser.uid}/${Date.now()}`;
      const imgRef = storageRef(storage, path);
      await uploadBytes(imgRef, blob);
      downloadUrl = await getDownloadURL(imgRef);
    } else {
      downloadUrl = imageUri;
    }

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

  const addReview = async (
    productId: string,
    review: Omit<Review, 'id' | 'createdAt'>
  ) => {
    try {
      const reviewsRef = collection(db, 'products', productId, 'reviews');
      const docRef = await addDoc(reviewsRef, {
        ...review,
        createdAt: serverTimestamp(),
      });
      // Actualizar estado local
      setProducts(prev => prev.map(prod => 
        prod.id === productId
          ? { ...prod, reviews: [{ ...review, id: docRef.id, createdAt: new Date() }, ...prod.reviews] }
          : prod
      ));
    } catch (err) {
      console.error('Error al añadir review:', err);
    }
  };

  return (
    <ProductContext.Provider value={{ products, loading, error, addProduct, addReview }}>
      {children}
    </ProductContext.Provider>
  );
};