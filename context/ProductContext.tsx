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
  sellerId: string;
  title: string;
  description: string;
  category: Category;
  image: string;
  price: number;
  stock: number;
  reviews: Review[];
  createdAt: any;
}

interface ProductContextType {
  products: Product[];
  loading: boolean;
  error: string | null;
  addReview: (productId: string, review: Omit<Review, "id" | "createdAt">) => Promise<void>;
  addProduct: (product: Omit<Product, "id" | "reviews" | "createdAt">) => Promise<void>;
}

// ===================== Contexto =====================

export const ProductContext = createContext<ProductContextType>({
  products: [],
  loading: true,
  error: null,
  addReview: async () => {},
  addProduct: async () => {},
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
        let imageUrl = "";
        if (data.image) {
          try {
            const imageRef = ref(storage, data.image);
            imageUrl = await getDownloadURL(imageRef);
          } catch (error) {
            console.warn(`No se pudo obtener URL de imagen para ${doc.id}:`, error);
            imageUrl = ""; // o una imagen por defecto si prefieres
          }
        }

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
          sellerId: data.sellerId,
          title: data.title,
          description: data.description,
          category: data.category,
          image: imageUrl,
          price: data.price,
          stock: data.stock,
          reviews,
          createdAt: data.createdAt,
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

  // ===================== Añadir Review =====================
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

      setProducts((prev) =>
        prev.map((product) =>
          product.id === productId
            ? {
                ...product,
                reviews: [
                  {
                    ...review,
                    id: docRef.id,
                    createdAt: new Date(), // temporal
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

  // ===================== Añadir Producto =====================
  const addProduct = async (
    product: Omit<Product, "id" | "reviews" | "createdAt">
  ): Promise<void> => {
    try {
      const docRef = await addDoc(collection(db, "products"), {
        ...product,
        createdAt: serverTimestamp(),
      });

      setProducts((prev) => [
        {
          ...product,
          id: docRef.id,
          reviews: [],
          createdAt: new Date(), // temporal
        },
        ...prev,
      ]);
    } catch (error) {
      console.error("Error al añadir producto:", error);
    }
  };

  return (
    <ProductContext.Provider
      value={{ products, loading, error, addReview, addProduct }}
    >
      {children}
    </ProductContext.Provider>
  );
};
