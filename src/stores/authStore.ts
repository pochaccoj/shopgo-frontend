import { atom } from 'nanostores';
import type { User } from '../types';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
}

const saved = localStorage.getItem('auth');
const initial: AuthState = saved
  ? JSON.parse(saved)
  : { user: null, accessToken: null, refreshToken: null };

export const authStore = atom<AuthState>(initial);

export function setAuth(user: User, accessToken: string, refreshToken: string) {
  const state = { user, accessToken, refreshToken };
  authStore.set(state);
  localStorage.setItem('auth', JSON.stringify(state));
}

export function setAccessToken(accessToken: string) {
  const state = { ...authStore.get(), accessToken };
  authStore.set(state);
  localStorage.setItem('auth', JSON.stringify(state));
}

export function clearAuth() {
  authStore.set({ user: null, accessToken: null, refreshToken: null });
  localStorage.removeItem('auth');
}
