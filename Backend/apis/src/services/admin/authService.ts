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
  console.log("USUARIO PARA LOGIN:",user);
  console.log("PASSWORD en la base de datos:",user.password);
  console.log("PASSWORD ingresado para login:",password);
  const ok = password === user.password;
  //const ok = await bcrypt.compare(password, user.password);
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

export async function refreshService(
  oldRefreshToken: string,
  meta?: { ip?: string; ua?: string }
) {
  // verifyAndRotateRefresh valida, revoca la anterior, crea una nueva y devuelve nuevo access+refresh
  return verifyAndRotateRefresh(oldRefreshToken, undefined, meta);
}

export async function logoutService(oldRefreshToken: string) {
  return revokeRefreshByToken(oldRefreshToken);
}
