import { collection, getDocs } from 'firebase/firestore';
import { getDownloadURL, ref } from 'firebase/storage';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { db, storage } from '../utils/FirebaseConfig'; // Asegúrate de tener esto bien configurado

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

export interface Product {
  id: string;
  title: string;
  description: string;
  category: Category;
  image: string; // URL de Firebase Storage
  price: number;
  stock: number;
}

interface ProductContextType {
  products: Product[];
  loading: boolean;
  error: string | null;
}

export const ProductContext = createContext<ProductContextType>({
  products: [],
  loading: true,
  error: null,
});

export const useProducts = () => useContext(ProductContext);

export const ProductProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'products'));
        const productsData: Product[] = [];

        for (const doc of querySnapshot.docs) {
          const data = doc.data();
          const imageRef = ref(storage, data.image); // La ruta en storage debe estar guardada en data.image
          const imageUrl = await getDownloadURL(imageRef);

          productsData.push({
            id: doc.id,
            title: data.title,
            description: data.description,
            category: data.category,
            image: imageUrl,
            price: data.price,
            stock: data.stock,
          });
        }

        setProducts(productsData);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <ProductContext.Provider value={{ products, loading, error }}>
      {children}
    </ProductContext.Provider>
  );
};
