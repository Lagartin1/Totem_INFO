import { mongoClient } from "@/database/mongodb"
import { ok } from "assert";
import bcrypt from "bcrypt";


export interface UserInfo {
  id: string;
  username: string;
  email?: string;
  nombre?: string;
  apellido?: string;
  password: string; // HASH: se usa solo en backend
  authoriced: boolean;
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
      authoriced: true,
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

async function registerNewUser(params: { username: string; email: string; password: string; nombre: string; apellido: string }) {
  const hashedPassword = await bcrypt.hash(params.password, 10);
  const newUser = await mongoClient.usuario.create({
    data: {
      username: params.username,
      email: params.email,
      password: hashedPassword,
      nombre: params.nombre,
      apellido: params.apellido,
      authoriced: false,
      createdAt: new Date(),
    },
  });
  if (newUser) {
    return {
      ok : true,
    };
  }
  return null;
}





export {getRegistrosByUserId, getSesionesByUserId, getUserById, getUserByCredentials, registerNewUser};