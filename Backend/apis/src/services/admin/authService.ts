// src/services/authService.ts
import bcrypt from 'bcrypt';
import { getUserByCredentials,UserInfo } from '@/models/admin/userModel'; // toPublicUser: crea un user "público" sin password
import {
  signAccessToken,
  createRefreshSession,
  verifyAndRotateRefresh,
  revokeRefreshByToken,
} from '@/lib/auth/login_tools';


export type LoginResult = {
  user: UserInfo;
  accessToken: string;
  refreshToken: string;
  refreshExpiresAt: Date;
};

export async function loginService(
  identifier: string,
  password: string,
  meta?: { ip?: string; ua?: string }
): Promise<LoginResult | null> {
  // En tu userModel solo existe getUserByCredentials(username).
  // Si quieres login por email también, crea otro método en userModel.
  const user = await getUserByCredentials(identifier.trim().toLowerCase());
  if (!user) return null;

  // si tienes isActive/lockedUntil en el select, puedes validar aquí
  // if (!user.isActive) return null;
  // if (user.lockedUntil && user.lockedUntil > new Date()) return null;
  // verficar sin un pasword haseado en la base de datos para pruebas seria asi:
  //const ok = password === user.password;
  const ok = await bcrypt.compare(password, user.password);
  if (!ok) return null;

  const accessToken = await signAccessToken({
    sub: user.id,
    username: user.username,
    email: user.email,
  });

  const { refreshToken, expiresAt } = await createRefreshSession(user.id, meta);
  const userdata = user as UserInfo;
  return {
    user: userdata,
    accessToken,
    refreshToken,
    refreshExpiresAt: expiresAt,
  };
}

export async function refreshService(oldRefreshToken: string, meta?: { ip?: string; ua?: string }) {
  // Rota y valida token
  const data = await verifyAndRotateRefresh(oldRefreshToken, undefined, meta);
  if (!data) return null;

  // Si necesitas más info del usuario (opcional):
  // const user = await getUserById(data.sub);

  return {
    accessToken: data.accessToken,
    refreshToken: data.refreshToken,
    refreshExpiresAt: data.refreshExpiresAt,
    // user, // opcional
  };
}

export async function logoutService(oldRefreshToken: string) {
  return revokeRefreshByToken(oldRefreshToken);
}
