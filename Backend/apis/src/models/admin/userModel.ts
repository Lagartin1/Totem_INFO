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
  sesiones?: any[];
}

export interface SessionInfo {
  id: string;
  userId: string;
  sessionIdHash: string;
  createdAt: Date;
  lastActivity: Date;
  expiresAt: Date;
  revokedAt?: Date;
  replacedBy?: string;
}



async function getUserById(userId: string) {
  const user = await mongoClient.usuario.findUnique({
    where: { id: userId },
    select: {
      id: true,
      username: true,
      email: true,
      nombre: true,
      apellido: true,
      createdAt: true,
      registros: false, // incluye si lo necesitas
      sesiones:true,

    },
  });
  return user;
}

async function getUserByCredentials(username: string) {
  const user = await mongoClient.usuario.findUnique({
    where: { username },
    select: {
      id: true,
      username: true,
      email: true,
      nombre: true,
      apellido: true,
      password: true, // HASH
      createdAt: true,
      registros: true, // incluye si lo necesitas
      sesiones:true,
    },
  });
  return user;
}
  


async function getRegistrosByUserId(userId: string) {
  const user = await mongoClient.usuario.findUnique({
    where: { id: userId },
    select: {
      registros: true, // incluye si lo necesitas
    },
  });
  return user?.registros || [];
}


async function getSesionesByUserId(userId: string) {
  const user = await mongoClient.usuario.findUnique({
    where: { id: userId },
    select: {
      sesiones: true, // incluye si lo necesitas
    },
  });
  return user?.sesiones || [];
}


export {getRegistrosByUserId, getSesionesByUserId, getUserById, getUserByCredentials};