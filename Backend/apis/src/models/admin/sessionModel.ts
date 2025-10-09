import {mongoClient} from "@/database/mongodb"



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

async function createSessionForUser(userId: string, sessionIdHash: string, expiresAt: Date) {
  const session = await mongoClient.session.create({
    data: {
      userId,
      sessionIdHash,
      expiresAt,
    },
  });
  return session;
}

async function getSesionesByUserId(userId: string) {
  const user = await mongoClient.usuario.findUnique({
    where: { id: userId },
    select: { sesiones: true },
  });
  return user?.sesiones || [];
}


async function replaceSession(oldSessionId: string, newSessionIdHash: string, newExpiresAt: Date, replacedAt = new Date()) {
  const oldSession = await mongoClient.session.findUnique({
    where: { id: oldSessionId },
  });
  if (!oldSession) throw new Error('sesion antigua no encontrada');

  const newSession = await mongoClient.session.create({
    data: {
      userId: oldSession.userId,
      sessionIdHash: newSessionIdHash,
      expiresAt: newExpiresAt,
    },
  });
  
  await mongoClient.session.update({
    where: { id: oldSessionId },
    data: { revokedAt: replacedAt, replacedBy: newSession.id },
  });

  return newSession;
}

async function revokeSession(sessionId: string, revokedAt = new Date()) {
  const session = await mongoClient.session.update({
    where: { id: sessionId },
    data: { revokedAt },
  });
  return session;
}
