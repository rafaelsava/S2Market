import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import React, { createContext, useContext, useState } from "react";
import { db } from "../utils/FirebaseConfig";

export interface CartItem {
  productId: string;
  quantity: number;
}

export type MeetingPoint =
  | "Edificio K"
  | "Ad Portas"
  | "Villa de Leyva"
  | "Edificio G"
  | "Edificio D"
  | "Edificio O"
  | "Biblioteca"
  | "Edificio Atelier"
  | "Edificio H"
  | "Anfiteatro"
  | "CAF"
  | "Meson"
  | "Edificio A"
  | "Edificio B"
  | "Edificio C";

export type PaymentMethod = "Nequi" | "Efectivo" | "Llaves";

interface CartContextType {
  cart: CartItem[];
  addToCart: (productId: string, quantity?: number) => void;
  incrementQuantity: (productId: string) => void;
  decrementQuantity: (productId: string) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  placeOrder: (
    userId: string,
    meetingPoint: MeetingPoint,
    paymentMethod: PaymentMethod
  ) => Promise<void>;
}

const CartContext = createContext<CartContextType>({} as CartContextType);

export const useCart = () => useContext(CartContext);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [cart, setCart] = useState<CartItem[]>([]);

  const addToCart = (productId: string, quantity: number = 1) => {
    console.log("Adding to cart", productId, quantity);
    setCart((prev) => {
      const exist = prev.find((item) => item.productId === productId);
      if (exist) {
        return prev.map((item) =>
          item.productId === productId
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { productId, quantity }];
    });
  };

  const incrementQuantity = (productId: string) => {
    setCart((prev) =>
      prev.map((item) =>
        item.productId === productId
          ? { ...item, quantity: item.quantity + 1 }
          : item
      )
    );
  };

  const decrementQuantity = (productId: string) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.productId === productId && item.quantity > 1
            ? { ...item, quantity: item.quantity - 1 }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.productId !== productId));
  };

  const clearCart = () => {
    setCart([]);
  };

  const placeOrder = async (
    userId: string,
    meetingPoint: MeetingPoint,
    paymentMethod: PaymentMethod
  ) => {
    if (cart.length === 0) throw new Error("El carrito está vacío");

    const orderData = {
      userId,
      items: cart,
      meetingPoint,
      paymentMethod,
      status: "pendiente",
      createdAt: serverTimestamp(),
    };

    await addDoc(collection(db, "orders"), orderData);
    clearCart();
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        incrementQuantity,
        decrementQuantity,
        removeFromCart,
        clearCart,
        placeOrder,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
