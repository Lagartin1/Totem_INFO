import { UserInfo } from '@/models/admin/userModel'
import { mongoClient } from '@/database/mongodb';


async function getRegisteredUsers(): Promise<UserInfo[]>{
  const users = await mongoClient.usuario.findMany({
    select: {
      id: true,
      username: true,
      email: true,
      nombre: true,
      apellido: true,
      authoriced: true,
      createdAt: false,
      registros: false, // incluye si lo necesitas
      sesiones: false,
    },
    where: {
      authoriced: false,
    },
  });
  return users as UserInfo[];
}


async function acceptRegisteredUser(userId: string) {

  const result = await mongoClient.usuario.update({
    where: { id: userId },
    data: { authoriced: true },
  });
  if (!result) {
    throw new Error('Error al autorizar el usuario');
  }
  return { ok: true, userId };
}



export { getRegisteredUsers, acceptRegisteredUser };  