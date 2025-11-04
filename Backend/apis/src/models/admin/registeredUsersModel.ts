import { UserInfo } from '@/models/admin/userModel'
import { mongoClient } from '@/database/mongodb';
import { fa } from 'zod/locales';


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


export { getRegisteredUsers };