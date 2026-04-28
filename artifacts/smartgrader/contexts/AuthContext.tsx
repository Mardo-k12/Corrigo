import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { STORAGE_KEYS, getJSON, hashPassword, newId, removeKey, setJSON } from "@/lib/storage";
import type { User } from "@/lib/types";

type StoredUser = User & { passwordHash: string; salt: string };

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (input: { email: string; password: string; name: string; institution?: string }) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (patch: Partial<Pick<User, "name" | "institution">>) => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

async function loadUsers(): Promise<StoredUser[]> {
  return getJSON<StoredUser[]>(STORAGE_KEYS.users, []);
}

async function saveUsers(users: StoredUser[]): Promise<void> {
  await setJSON(STORAGE_KEYS.users, users);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const sessionUserId = await getJSON<string | null>(STORAGE_KEYS.session, null);
      if (sessionUserId) {
        const users = await loadUsers();
        const match = users.find((u) => u.id === sessionUserId);
        if (match) {
          const { passwordHash: _ph, salt: _s, ...publicUser } = match;
          setUser(publicUser);
        }
      }
      setLoading(false);
    })();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !password) throw new Error("Email et mot de passe requis");
    const users = await loadUsers();
    const found = users.find((u) => u.email === cleanEmail);
    if (!found) throw new Error("Aucun compte trouvé pour cet email");
    if (found.passwordHash !== hashPassword(password, found.salt)) {
      throw new Error("Mot de passe incorrect");
    }
    await setJSON(STORAGE_KEYS.session, found.id);
    const { passwordHash: _ph, salt: _s, ...publicUser } = found;
    setUser(publicUser);
  }, []);

  const register = useCallback(
    async ({ email, password, name, institution }: { email: string; password: string; name: string; institution?: string }) => {
      const cleanEmail = email.trim().toLowerCase();
      if (!cleanEmail) throw new Error("Email requis");
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) throw new Error("Format d'email invalide");
      if (!password || password.length < 6) throw new Error("Mot de passe : 6 caractères minimum");
      if (!name.trim()) throw new Error("Nom requis");

      const users = await loadUsers();
      if (users.some((u) => u.email === cleanEmail)) {
        throw new Error("Un compte existe déjà pour cet email");
      }
      const salt = newId();
      const newUser: StoredUser = {
        id: newId(),
        email: cleanEmail,
        name: name.trim(),
        institution: institution?.trim() || "UPC - Université Protestante au Congo",
        createdAt: Date.now(),
        passwordHash: hashPassword(password, salt),
        salt,
      };
      users.push(newUser);
      await saveUsers(users);
      await setJSON(STORAGE_KEYS.session, newUser.id);
      const { passwordHash: _ph, salt: _s, ...publicUser } = newUser;
      setUser(publicUser);
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
      const users = await loadUsers();
      const idx = users.findIndex((u) => u.id === user.id);
      if (idx === -1) return;
      const existing = users[idx];
      if (!existing) return;
      const updated: StoredUser = { ...existing, ...patch };
      users[idx] = updated;
      await saveUsers(users);
      const { passwordHash: _ph, salt: _s, ...publicUser } = updated;
      setUser(publicUser);
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
