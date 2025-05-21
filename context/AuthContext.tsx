import { auth, db } from "@/utils/FirebaseConfig";
import {
  createUserWithEmailAndPassword,
  User as FirebaseUser,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { createContext, useEffect, useState } from "react";

// Solo dos roles permitidos
type UserRole = "comprador" | "vendedor";

interface UserProfile {
  name: string;
  email: string;
  role: UserRole;
  createdAt?: Date;
}

interface AuthContextInterface {
  currentUser: FirebaseUser | null;
  profile: UserProfile | null;            // Nuevo estado con perfil
  login: (email: string, password: string) => Promise<UserRole | null>;
  register: (user: {
    name: string;
    email: string;
    password: string;
    role: UserRole;
  }) => Promise<boolean>;
  logout: () => Promise<void>;
  updateUser: (user: Partial<{ name: string; role: UserRole }>) => Promise<void>;
  updateRole: (role: UserRole) => Promise<void>;
}

export const AuthContext = createContext({} as AuthContextInterface);

export const AuthProvider = ({ children }: any) => {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null); // Nuevo

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
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
      } else {
        setProfile(null);
      }
    });
    return () => unsubscribe();
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
  }): Promise<boolean> => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, user.email, user.password);
      const firebaseUser = userCredential.user;
      await updateProfile(firebaseUser, { displayName: user.name });

      await setDoc(doc(db, "users", firebaseUser.uid), {
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: new Date(),
      });

      return true;
    } catch (error) {
      console.log("Error al registrar:", error);
      return false;
    }
  };

  const updateUser = async (user: Partial<{ name: string; role: UserRole }>) => {
    if (auth.currentUser) {
      if (user.name) {
        await updateProfile(auth.currentUser, { displayName: user.name });
      }
      await setDoc(doc(db, "users", auth.currentUser.uid), user, { merge: true });

      // Actualizar el perfil local también:
      setProfile((prev) => (prev ? { ...prev, ...user } : prev));
    }
  };

  const updateRole = async (role: UserRole) => {
    if (auth.currentUser) {
      await setDoc(doc(db, "users", auth.currentUser.uid), { role }, { merge: true });
      setProfile((prev) => (prev ? { ...prev, role } : prev));
    }
  };

  const logout = async () => {
    await signOut(auth);
    setProfile(null);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
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
