// Auth endpoints
import { apiPost } from './client';
import type { AuthResponse, OtpChannel } from './types';
import { getDeviceName } from '../lib/deviceInfo';

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
}): Promise<AuthResponse> {
  // On envoie le nom de l'appareil pour qu'il apparaisse dans "Appareils connectés"
  return apiPost<AuthResponse>('/v1/auth/signup', { ...body, deviceName: getDeviceName() });
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
