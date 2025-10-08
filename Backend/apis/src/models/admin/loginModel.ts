import { mongoClient } from "@/database/mongodb"



export interface UserInfo {
  id: string;
  username: string;
  email?: string;
  nombre?: string;
  apellido?: string;
  password: string; // HASH: se usa solo en backend
  createdAt: Date;
  registros?: any[]; // incluye si lo necesitas
}

export async function getUserInfo(usuario: string) : Promise<UserInfo | null> {
  
  const idf = usuario?.trim();
  if (!idf) {
    console.log("Invalid identifier provided");
    throw new Error("Invalid identifier");
  }
  // Permite login por username o email (saca email si no existe en tu esquema)
  const user = await mongoClient.usuario.findFirst({
    where: {
      OR: [
        { username: idf },
        { email: idf }, // elimina si no tienes email en el modelo
      ],
    },
    select: {
      id: true,
      username: true,
      email: true,     // elimina si no existe
      nombre: true,
      apellido: true,
      password: true,  // HASH: se usa solo en backend
      createdAt: true,
      registros: false // incluye si lo necesitas
    },
  });
    
  if (!user) {
    console.log("User not found with identifier:", usuario);
    return null;
  }
  return user as UserInfo;
}
