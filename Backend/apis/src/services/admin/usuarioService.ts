import { mongoClient } from "@/database/mongodb";
import bcrypt from "bcrypt";

export async function createUser(data: {
  nombre: string;
  apellido: string;
  email: string;
  username: string;
  password: string;
}) {
  // 🔒 1. Hashear la contraseña
  const hashedPassword = await bcrypt.hash(data.password, 10);

  // 🧠 2. Crear el usuario en la base de datos
  const user = await mongoClient.usuario.create({
    data: {
      nombre: data.nombre,
      apellido: data.apellido,
      email: data.email,
      username: data.username,
      password: hashedPassword,
    },
  });

  // 🚫 3. No devolver el hash de la contraseña
  const { password, ...safeUser } = user;
  return safeUser;
}
