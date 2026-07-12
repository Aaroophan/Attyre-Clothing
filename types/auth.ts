import type { UserRole } from './database';

export interface PublicUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
}

export interface AuthSessionPayload extends PublicUser {
  issuedAt: number;
  expiresAt: number;
}

export interface AuthSuccessResponse {
  ok: true;
  user: PublicUser;
  message: string;
}

export interface AuthErrorResponse {
  ok: false;
  message: string;
  fieldErrors?: Record<string, string>;
}

export type AuthResponse = AuthSuccessResponse | AuthErrorResponse;
