// context/ProductContext.tsx

import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
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
  photoURL?: string; // URL de la foto del usuario
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
  addReview: (
    productId: string,
    review: Omit<Review, "id" | "createdAt">
  ) => Promise<void>;
  addProduct: (
    product: Omit<Product, "id" | "reviews" | "createdAt">
  ) => Promise<void>;
  /** Elimina un producto por su ID */
  deleteProduct: (productId: string) => Promise<void>;
  /** Actualiza título, precio y/o stock de un producto */
  updateProduct: (
    productId: string,
    updates: Partial<Pick<Product, "title" | "price" | "stock">>
  ) => Promise<void>;
}

// ===================== Contexto =====================

export const ProductContext = createContext<ProductContextType>({
  products: [],
  loading: true,
  error: null,
  addReview: async () => {},
  addProduct: async () => {},
  deleteProduct: async () => {},
  updateProduct: async () => {},
});

export const useProducts = () => useContext(ProductContext);

export const ProductProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "products"));
      const productsData: Product[] = [];

      for (const doc of querySnapshot.docs) {
        const data = doc.data();
        let imageUrl = "";
        if (data.image) {
          try {
            const imageRef = ref(storage, data.image);
            imageUrl = await getDownloadURL(imageRef);
          } catch (error) {
            console.warn(
              `No se pudo obtener URL de imagen para ${doc.id}:`,
              error
            );
            imageUrl = "";
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
                    createdAt: new Date(),
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
          createdAt: new Date(),
        },
        ...prev,
      ]);
    } catch (error) {
      console.error("Error al añadir producto:", error);
    }
  };

  // ===================== Eliminar Producto =====================
  const deleteProduct = async (productId: string) => {
    try {
      await deleteDoc(doc(db, "products", productId));
      setProducts((prev) => prev.filter((p) => p.id !== productId));
    } catch (err) {
      console.error("Error al eliminar producto:", err);
    }
  };

  // ===================== Actualizar Producto =====================
  const updateProduct = async (
    productId: string,
    updates: Partial<Pick<Product, "title" | "price" | "stock">>
  ) => {
    try {
      const prodRef = doc(db, "products", productId);
      await updateDoc(prodRef, updates);
      setProducts((prev) =>
        prev.map((p) =>
          p.id === productId ? { ...p, ...updates } : p
        )
      );
    } catch (err) {
      console.error("Error al actualizar producto:", err);
    }
  };

  return (
    <ProductContext.Provider
      value={{
        products,
        loading,
        error,
        addReview,
        addProduct,
        deleteProduct,
        updateProduct,
      }}
    >
      {children}
    </ProductContext.Provider>
  );
};
