// Auth endpoints
import { apiPost } from './client';
import type { AuthResponse, OtpChannel } from './types';
import { getDeviceName } from '../lib/deviceInfo';

// Étape 1 du signup : stocke un PendingSignup côté backend + envoie l'OTP WhatsApp.
// Aucun compte User n'est créé tant que l'OTP n'est pas validé.
// Renvoie le numéro destinataire de l'OTP (pour affichage côté mobile).
export type SignupPendingResponse = { ok: true; pendingPhone: string; otpTarget: string };

export function signup(body: {
  name: string;
  phone: string;
  password: string;
  email?: string;
  whatsapp?: string;
  sex?: 'F' | 'M' | 'OTHER';
  dob?: string;
  country?: string;
  referredBy?: string;
}): Promise<SignupPendingResponse> {
  return apiPost<SignupPendingResponse>('/v1/auth/signup', { ...body, deviceName: getDeviceName() });
}

// Étape 2 du signup : valide l'OTP et crée le compte. Renvoie le token de session.
export function signupConfirm(phone: string, code: string): Promise<AuthResponse> {
  return apiPost<AuthResponse>('/v1/auth/signup/confirm', { phone, code });
}

export function login(identifier: string, password: string): Promise<AuthResponse> {
  return apiPost<AuthResponse>('/v1/auth/login', { identifier, password, deviceName: getDeviceName() });
}

export function sendOtp(contact: string, channel: OtpChannel): Promise<{ ok: true; expiresInSeconds: number }> {
  return apiPost('/v1/auth/otp/send', { contact, channel });
}

export function verifyOtp(contact: string, channel: OtpChannel, code: string): Promise<{ ok: true }> {
  return apiPost('/v1/auth/otp/verify', { contact, channel, code });
}

export function forgotPassword(contact: string, channel: OtpChannel): Promise<{ ok: true }> {
  return apiPost('/v1/auth/forgot-password', { contact, channel });
}

export function resetPassword(contact: string, channel: OtpChannel, code: string, newPassword: string): Promise<{ ok: true }> {
  return apiPost('/v1/auth/reset-password', { contact, channel, code, newPassword });
}

export function logout(): Promise<{ ok: true }> {
  return apiPost('/v1/auth/logout');
}
