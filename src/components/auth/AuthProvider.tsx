"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { onAuthStateChanged, signOut, type User } from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebase";
import { getOrCreateUser, subscribeToUser } from "@/lib/firestore";
import type { AppUser } from "@/types";

interface AuthContextValue {
  firebaseUser: User | null;
  appUser: AppUser | null;
  loading: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  firebaseUser: null,
  appUser: null,
  loading: true,
  logout: async () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

export default function AuthProvider({ children }: { children: ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [appUser, setAppUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(getFirebaseAuth(), async (user) => {
      setFirebaseUser(user);
      if (!user) {
        setAppUser(null);
        setLoading(false);
        return;
      }

      const created = await getOrCreateUser(
        user.uid,
        user.email ?? "",
        user.displayName ?? "",
        user.photoURL ?? "",
      );
      setAppUser(created);
      setLoading(false);
    });

    return () => unsubAuth();
  }, []);

  // Real-time listener on the user doc so approval status updates live
  useEffect(() => {
    if (!firebaseUser) return;
    const unsub = subscribeToUser(firebaseUser.uid, (user) => {
      if (user) setAppUser(user);
    });
    return () => unsub();
  }, [firebaseUser]);

  const logout = async () => {
    await signOut(getFirebaseAuth());
    setAppUser(null);
  };

  return (
    <AuthContext.Provider value={{ firebaseUser, appUser, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
