// API client — axios instance avec intercepteur JWT
import axios, { AxiosError, AxiosRequestConfig } from 'axios';
import { useAuthStore } from '../store/auth';

const BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ?? 'https://donia-api-production.up.railway.app';

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

// Inject JWT on every request if logged in
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers = config.headers ?? {};
    (config.headers as Record<string, string>).Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auto-logout on 401 (token expired/revoked). We tag the error so the UI layer
// can show a friendly "Session expirée" instead of the raw axios "Network Error"
// message that 401s sometimes surface as on React Native.
api.interceptors.response.use(
  (r) => r,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      const store = useAuthStore.getState();
      if (store.token) {
        (error as AxiosError & { isSessionExpired?: boolean }).isSessionExpired = true;
        store.signOut();
      }
    }
    return Promise.reject(error);
  },
);

// Surface domain error message from backend (which returns {error: {code, message}})
export function getApiErrorMessage(e: unknown): string {
  if (axios.isAxiosError(e)) {
    if ((e as AxiosError & { isSessionExpired?: boolean }).isSessionExpired) {
      return 'Session expirée. Reconnecte-toi pour continuer.';
    }
    const data = e.response?.data as { error?: { message?: string } } | undefined;
    if (data?.error?.message) return data.error.message;
    if (e.message === 'Network Error') {
      return 'Impossible de joindre le serveur. Vérifie ta connexion internet et réessaie.';
    }
    return e.message;
  }
  return e instanceof Error ? e.message : 'Erreur inconnue';
}

// Convenience typed helpers
export async function apiGet<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
  return (await api.get<T>(url, config)).data;
}
export async function apiPost<T>(url: string, body?: unknown, config?: AxiosRequestConfig): Promise<T> {
  return (await api.post<T>(url, body, config)).data;
}
export async function apiPatch<T>(url: string, body?: unknown, config?: AxiosRequestConfig): Promise<T> {
  return (await api.patch<T>(url, body, config)).data;
}
export async function apiDelete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
  return (await api.delete<T>(url, config)).data;
}
