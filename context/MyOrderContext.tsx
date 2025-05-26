// context/MyOrdersContext.tsx
import * as Notifications from "expo-notifications";
import {
  collection,
  FirestoreError,
  onSnapshot,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import React, { createContext, useContext, useEffect, useState } from "react";
import { db } from "../utils/FirebaseConfig";
import { AuthContext } from "./AuthContext";

export interface OrderItem {
  productId: string;
  quantity: number;
}

export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  meetingPoint: string;
  paymentMethod: string;
  status: string;
  createdAt: any; // Firestore Timestamp
}

interface MyOrdersContextType {
  orders: Order[];
  loading: boolean;
  error: string | null;
}

const MyOrdersContext = createContext<MyOrdersContextType>({
  orders: [],
  loading: true,
  error: null,
});

export const useMyOrders = () => useContext(MyOrdersContext);

export const MyOrdersProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { currentUser } = useContext(AuthContext);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!currentUser?.uid) {
      setOrders([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const q = query(
      collection(db, "orders"),
      where("userId", "==", currentUser.uid),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(
      q,
      (snap) => {
        setLoading(false);
        const data = snap.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<Order, "id">),
        }));
        setOrders(data);

        // Para cada cambio, si es modification, disparar notificación local
        snap.docChanges().forEach(async (change) => {
          if (change.type === "modified") {
            const updated = change.doc.data() as Order;
            try {
              await Notifications.scheduleNotificationAsync({
                content: {
                  title: "Orden actualizada",
                  body: `Tu pedido ${change.doc.id.slice(0,6)}… ahora está "${updated.status}"`,
                  data: { orderId: change.doc.id },
                },
                trigger: null, // inmediata
              });
            } catch (e) {
              console.error("Error notificando cambio de orden:", e);
            }
          }
        });
      },
      (err: FirestoreError) => {
        setLoading(false);
        setError(err.message);
      }
    );

    return () => unsubscribe();
  }, [currentUser?.uid]);

  return (
    <MyOrdersContext.Provider value={{ orders, loading, error }}>
      {children}
    </MyOrdersContext.Provider>
  );
};
