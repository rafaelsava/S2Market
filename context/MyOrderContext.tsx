import { collection, getDocs, orderBy, query, where } from "firebase/firestore";
import React, { createContext, useContext, useState } from "react";
import { db } from "../utils/FirebaseConfig";

interface OrderItem {
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
  fetchOrders: (userId: string) => Promise<void>;
}

const MyOrdersContext = createContext<MyOrdersContextType>({
  orders: [],
  loading: false,
  error: null,
  fetchOrders: async () => {},
});

export const useMyOrders = () => useContext(MyOrdersContext);

export const MyOrdersProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = async (userId: string) => {
    setLoading(true);
    setError(null);
    try {
      const q = query(
        collection(db, "orders"),
        where("userId", "==", userId),
        orderBy("createdAt", "desc")
      );
      const querySnapshot = await getDocs(q);

      const ordersData: Order[] = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<Order, "id">),
      }));

      setOrders(ordersData);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <MyOrdersContext.Provider
      value={{ orders, loading, error, fetchOrders }}
    >
      {children}
    </MyOrdersContext.Provider>
  );
};
