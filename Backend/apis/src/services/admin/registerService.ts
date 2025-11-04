import { registerNewUser } from "@/models/admin/userModel";

async function registerService(params: { username: string; email: string; password: string; nombre: string; apellido: string }) {
  const result = await registerNewUser(params);
  if (!result) {
    throw new Error('Error al registrar el usuario');
  }
  return { ok: true };
}

export { registerService };
