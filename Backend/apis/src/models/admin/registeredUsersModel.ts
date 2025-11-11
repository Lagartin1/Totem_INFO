import { UserInfo } from '@/models/admin/userModel'
import { mongoClient } from '@/database/mongodb';


async function getRegisteredUsers(page: number = 1): Promise<{ users: UserInfo[], total: number }> {
  const pageSize = 5;
  const skip = (page - 1) * pageSize;

  const [users, total] = await Promise.all([
    mongoClient.usuario.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        nombre: true,
        apellido: true,
        authoriced: true,
      },
      where: { authoriced: false },
      skip,
      take: pageSize,
      orderBy: { createdAt: 'desc' }, // opcional, pero recomendable
    }),
    mongoClient.usuario.count({
      where: { authoriced: false },
    }),
  ]);

  return { users: users as UserInfo[], total };
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