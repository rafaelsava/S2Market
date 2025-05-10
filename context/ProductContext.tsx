import {
  addDoc,
  collection,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
} from "firebase/firestore";
import {
  getDownloadURL,
  ref,
} from "firebase/storage";
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { db, storage } from "../utils/FirebaseConfig";

// ===================== Tipos =====================

export type Category =
  | "Tecnología"
  | "Libros"
  | "Ropa"
  | "Hogar"
  | "Papelería"
  | "Deportes"
  | "Arte"
  | "Musica"
  | "Alimentos"
  | "Otros";

export interface Review {
  id: string;
  userId: string;
  name: string;
  rating: number;
  comment: string;
  createdAt: any; // Timestamp
}

export interface Product {
  id: string;
  title: string;
  description: string;
  category: Category;
  image: string;
  price: number;
  stock: number;
  reviews: Review[];
}

interface ProductContextType {
  products: Product[];
  loading: boolean;
  error: string | null;
  addReview: (productId: string, review: Omit<Review, "id" | "createdAt">) => Promise<void>;
}

// ===================== Contexto =====================

export const ProductContext = createContext<ProductContextType>({
  products: [],
  loading: true,
  error: null,
  addReview: async () => {},
});

export const useProducts = () => useContext(ProductContext);

export const ProductProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "products"));
      const productsData: Product[] = [];

      for (const doc of querySnapshot.docs) {
        const data = doc.data();
        const imageRef = ref(storage, data.image);
        const imageUrl = await getDownloadURL(imageRef);

        const reviewsSnapshot = await getDocs(
          query(
            collection(db, "products", doc.id, "reviews"),
            orderBy("createdAt", "desc")
          )
        );
        const reviews: Review[] = reviewsSnapshot.docs.map((reviewDoc) => ({
          id: reviewDoc.id,
          ...reviewDoc.data(),
        })) as Review[];

        productsData.push({
          id: doc.id,
          title: data.title,
          description: data.description,
          category: data.category,
          image: imageUrl,
          price: data.price,
          stock: data.stock,
          reviews,
        });
      }

      setProducts(productsData);
    } catch (err: any) {
      console.error("Error cargando productos:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // ===================== NUEVO: Añadir Review =====================
  const addReview = async (
    productId: string,
    review: Omit<Review, "id" | "createdAt">
  ) => {
    try {
      const refReviews = collection(db, "products", productId, "reviews");
      const docRef = await addDoc(refReviews, {
        ...review,
        createdAt: serverTimestamp(),
      });

      // Actualiza localmente el estado
      setProducts((prev) =>
        prev.map((product) =>
          product.id === productId
            ? {
                ...product,
                reviews: [
                  {
                    ...review,
                    id: docRef.id,
                    createdAt: new Date(), // temporalmente
                  },
                  ...product.reviews,
                ],
              }
            : product
        )
      );
    } catch (error) {
      console.error("Error al añadir review:", error);
    }
  };

  return (
    <ProductContext.Provider value={{ products, loading, error, addReview }}>
      {children}
    </ProductContext.Provider>
  );
};
