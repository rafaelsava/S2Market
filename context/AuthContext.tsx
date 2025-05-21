import { auth, db, storage } from "@/utils/FirebaseConfig";
import {
  createUserWithEmailAndPassword,
  User as FirebaseUser,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from "firebase/auth";
import { collection, doc, getDoc, onSnapshot, query, setDoc, where } from "firebase/firestore";
import { getDownloadURL, ref as storageRef, uploadBytes } from "firebase/storage";
import { createContext, useEffect, useState } from "react";

// Solo dos roles permitidos
type UserRole = "comprador" | "vendedor";

interface UserProfile {
  name: string;
  email: string;
  role: UserRole;
  photoURL?: string;
  createdAt?: Date;
}

interface AuthContextInterface {
  currentUser: FirebaseUser | null;
  profile: UserProfile | null;
  orderCount: number;

  login: (email: string, password: string) => Promise<UserRole | null>;
  register: (user: {
    name: string;
    email: string;
    password: string;
    role: UserRole;
    photoURL?: string;        // ahora opcional
  }) => Promise<boolean>;
  logout: () => Promise<void>;
  updateUser: (user: Partial<{ name: string; role: UserRole; photoFile: Blob }>) => Promise<void>;
  updateRole: (role: UserRole) => Promise<void>;
}

export const AuthContext = createContext({} as AuthContextInterface);

export const AuthProvider = ({ children }: any) => {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
    const [orderCount, setOrderCount] = useState(0);


useEffect(() => {
  let unsubscribeOrders: (() => void) | undefined;

  const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
    setCurrentUser(user);

    if (user) {
      try {
        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          setProfile(userDoc.data() as UserProfile);
        } else {
          setProfile(null);
        }
      } catch (error) {
        console.error("Error cargando perfil de usuario:", error);
        setProfile(null);
      }

      // Listener en tiempo real para órdenes
      try {
        const ordersRef = collection(db, "orders");
        const q = query(ordersRef, where("userId", "==", user.uid));

        unsubscribeOrders = onSnapshot(q, (querySnapshot) => {
          setOrderCount(querySnapshot.size);
        });
      } catch (error) {
        console.error("Error obteniendo número de órdenes:", error);
        setOrderCount(0);
      }
    } else {
      setProfile(null);
      setOrderCount(0);
      if (unsubscribeOrders) unsubscribeOrders();
    }
  });

  return () => {
    unsubscribeAuth();
    if (unsubscribeOrders) unsubscribeOrders();
  };
}, []);

  const login = async (email: string, password: string): Promise<UserRole | null> => {
    try {
      const response = await signInWithEmailAndPassword(auth, email, password);
      if (response.user) {
        const userDocRef = doc(db, "users", response.user.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          const data = userDoc.data();
          return data.role || null;
        }
      }
    } catch (error) {
      console.log("Error al iniciar sesión:", error);
    }
    return null;
  };

  const register = async (user: {
    name: string;
    email: string;
    password: string;
    role: UserRole;
    photoURL?: string;
  }): Promise<boolean> => {
    try {
      // 1) Crear usuario en Auth
      const userCredential = await createUserWithEmailAndPassword(auth, user.email, user.password);
      const firebaseUser = userCredential.user;
      const photoURL = user.photoURL;


      // 3) Actualizar perfil en Auth (displayName + photoURL)
      await updateProfile(firebaseUser, {
        displayName: user.name,
        ...(photoURL ? { photoURL } : {}),
      });

      // 4) Guardar datos en Firestore
      await setDoc(doc(db, "users", firebaseUser.uid), {
        name: user.name,
        email: user.email,
        role: user.role,
        ...(photoURL ? { photoURL } : {}),
        createdAt: new Date(),
      });

      return true;
    } catch (error) {
      console.log("Error al registrar:", error);
      return false;
    }
  };

  const updateUser = async (user: Partial<{ name: string; role: UserRole; photoFile: Blob }>) => {
    if (!auth.currentUser) return;

    // Si cambia nombre o foto en Auth
    const updates: Record<string, any> = {};
    if (user.name) {
      updates.displayName = user.name;
    }
    if (user.photoFile) {
      // Subir nueva foto
      const imgRef = storageRef(storage, `avatars/${auth.currentUser.uid}`);
      await uploadBytes(imgRef, user.photoFile);
      const newURL = await getDownloadURL(imgRef);
      updates.photoURL = newURL;
      // Reflejar en perfil local
      setProfile(prev => prev ? { ...prev, photoURL: newURL } : prev);
    }
    if (Object.keys(updates).length) {
      await updateProfile(auth.currentUser, updates);
    }

    // Actualizar Firestore
    const firestoreUpdates: Record<string, any> = {};
    if (user.name) firestoreUpdates.name = user.name;
    if (user.role) firestoreUpdates.role = user.role;
    await setDoc(doc(db, "users", auth.currentUser.uid), firestoreUpdates, { merge: true });

    // Reflejar cambios de nombre/rol en perfil local
    setProfile(prev => prev ? { ...prev, ...firestoreUpdates } : prev);
  };

  const updateRole = async (role: UserRole) => {
    if (!auth.currentUser) return;
    await setDoc(doc(db, "users", auth.currentUser.uid), { role }, { merge: true });
    setProfile(prev => prev ? { ...prev, role } : prev);
  };

  const logout = async () => {
    await signOut(auth);
    setProfile(null);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        orderCount,

        profile,
        login,
        register,
        updateUser,
        updateRole,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
