// hooks/useOrderNotifications.ts
import * as Notifications from "expo-notifications";
import { collection, onSnapshot } from "firebase/firestore";
import { useContext, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import { db } from "../utils/FirebaseConfig";

export function useOrderNotifications() {
  const { currentUser } = useContext(AuthContext);

  useEffect(() => {
    // Pedir permiso para notificaciones
    (async () => {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== "granted") {
        console.warn("Permiso de notificaciones no concedido");
      }
    })();

    if (!currentUser) return;
    let initialized = false;
    const ordersCol = collection(db, "orders");
    const unsubscribe = onSnapshot(ordersCol, (snapshot) => {
      if (!initialized) {
        initialized = true; // ignoramos la carga inicial
        return;
      }
      snapshot.docChanges().forEach((change) => {
        if (change.type === "added") {
          const data = change.doc.data() as any;
          // filtrar solo los ítems de este vendedor
          const myItems = (data.items || []).filter(
            (it: any) => it.sellerId === currentUser.uid
          );
          if (myItems.length > 0) {
            Notifications.scheduleNotificationAsync({
              content: {
                title: "¡Nueva orden recibida!",
                body: `Tienes ${myItems.length} nuevo(s) producto(s) vendidos.`,
                data: { orderId: change.doc.id },
              },
              trigger: null, // inmediatamente
            });
          }
        }
      });
    });

    return () => unsubscribe();
  }, [currentUser]);
}
