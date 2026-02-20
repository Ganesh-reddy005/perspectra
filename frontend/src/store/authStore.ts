import { create } from 'zustand';

interface User {
  user_id: string;
  email: string;
  name: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isInitialized: boolean; // true once initAuth() has run
  login: (token: string, user: User) => void;
  logout: () => void;
  initAuth: () => void;
}

/** Session duration: 3 days in milliseconds */
const SESSION_DURATION_MS = 3 * 24 * 60 * 60 * 1000;

const clearStorage = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  localStorage.removeItem('expiresAt');
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isInitialized: false,

  login: (token: string, user: User) => {
    const expiresAt = Date.now() + SESSION_DURATION_MS;
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('expiresAt', String(expiresAt));
    set({ token, user, isAuthenticated: true, isInitialized: true });
  },

  logout: () => {
    clearStorage();
    set({ token: null, user: null, isAuthenticated: false, isInitialized: true });
  },

  initAuth: () => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    const storedExpiry = localStorage.getItem('expiresAt');

    if (!token || !userStr) {
      clearStorage();
      set({ isInitialized: true });
      return;
    }

    // If expiresAt is missing (pre-fix sessions), grant a fresh 3-day window
    // rather than wiping a valid session.
    const expiresAt = storedExpiry ? Number(storedExpiry) : Date.now() + SESSION_DURATION_MS;

    if (Date.now() > expiresAt) {
      // Session truly expired
      clearStorage();
      set({ isInitialized: true });
      return;
    }

    // If expiry was missing, persist the new one so future reloads work correctly
    if (!storedExpiry) {
      localStorage.setItem('expiresAt', String(expiresAt));
    }

    try {
      const user = JSON.parse(userStr);
      set({ token, user, isAuthenticated: true, isInitialized: true });
    } catch {
      clearStorage();
      set({ isInitialized: true });
    }
  },
}));
