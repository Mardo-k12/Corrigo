import AsyncStorage from "@react-native-async-storage/async-storage";

export const STORAGE_KEYS = {
  users: "sg.users",
  session: "sg.session",
  courses: "sg.courses",
  students: "sg.students",
  exams: "sg.exams",
  grades: "sg.grades",
} as const;

export async function getJSON<T>(key: string, fallback: T): Promise<T> {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export async function setJSON<T>(key: string, value: T): Promise<void> {
  await AsyncStorage.setItem(key, JSON.stringify(value));
}

export async function removeKey(key: string): Promise<void> {
  await AsyncStorage.removeItem(key);
}

export function newId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 9);
}

export function hashPassword(password: string, salt: string): string {
  // Lightweight FNV-1a hash with salt — good enough for on-device local auth.
  // Not intended for server-side credential protection.
  const input = `${salt}::${password}::sg-upc`;
  let h = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  let h2 = 0xcbf29ce4;
  for (let i = input.length - 1; i >= 0; i--) {
    h2 ^= input.charCodeAt(i);
    h2 = Math.imul(h2, 0x100000001b3) >>> 0;
  }
  return h.toString(16).padStart(8, "0") + h2.toString(16).padStart(8, "0");
}
