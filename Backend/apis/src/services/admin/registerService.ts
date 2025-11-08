import { registerNewUser  } from "@/models/admin/userModel";
import { acceptRegisteredUser } from "@/models/admin/registeredUsersModel";

async function registerService(params: { username: string; email: string; password: string; nombre: string; apellido: string }) {
  const result = await registerNewUser(params);
  if (!result) {
    throw new Error('Error al registrar el usuario');
  }
  return { ok: true };
}

async function acceptRegisterService(userId: string) {
  const result = await acceptRegisteredUser(userId);
  if (!result.ok) {
    throw new Error('Error al aceptar el registro del usuario');
  }
  return { ok: true, userId: result.userId };
}


export { registerService, acceptRegisterService };
