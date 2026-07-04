import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { STORAGE_KEYS, getJSON, removeKey, setJSON } from "@/lib/storage";
import { authLogin, authRegister, getUser, updateUserProfile as updateUserProfileRequest } from "@/lib/api";
import type { User } from "@/lib/types";

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (input: { email: string; password: string; name: string; institution?: string }) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (patch: Partial<Pick<User, "name" | "institution">>) => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const sessionUserId = await getJSON<string | null>(STORAGE_KEYS.session, null);
      if (sessionUserId) {
        try {
          const sessionUser = await getUser(sessionUserId);
          setUser(sessionUser);
        } catch {
          await removeKey(STORAGE_KEYS.session);
        }
      }
      setLoading(false);
    })();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !password) throw new Error("Email et mot de passe requis");
    const found = await authLogin({ email: cleanEmail, password });
    await setJSON(STORAGE_KEYS.session, found.id);
    setUser(found);
  }, []);

  const register = useCallback(
    async ({ email, password, name, institution }: { email: string; password: string; name: string; institution?: string }) => {
      const cleanEmail = email.trim().toLowerCase();
      if (!cleanEmail) throw new Error("Email requis");
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) throw new Error("Format d'email invalide");
      if (!password || password.length < 6) throw new Error("Mot de passe : 6 caractères minimum");
      if (!name.trim()) throw new Error("Nom requis");

      const newUser = await authRegister({
        email: cleanEmail,
        password,
        name: name.trim(),
        institution: institution?.trim() || "UPC - Université Protestante au Congo",
      });
      await setJSON(STORAGE_KEYS.session, newUser.id);
      setUser(newUser);
    },
    [],
  );

  const logout = useCallback(async () => {
    await removeKey(STORAGE_KEYS.session);
    setUser(null);
  }, []);

  const updateProfile = useCallback(
    async (patch: Partial<Pick<User, "name" | "institution">>) => {
      if (!user) return;
      const updated = await updateUserProfileRequest(user.id, patch);
      setUser(updated);
    },
    [user],
  );

  const value = useMemo(
    () => ({ user, loading, login, register, logout, updateProfile }),
    [user, loading, login, register, logout, updateProfile],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
