
import { mongoClient } from '@/database/mongodb';


// Database operations
async function createSessionInDB(userId: string, tokenHash: string, expiresAt: Date, meta?: { ip?: string; ua?: string }) {
  return await mongoClient.session.create({
    data: {
      userId,
      sessionIdHash: tokenHash,
      expiresAt,
    },
  });
}

async function findActiveSessions() {
  return await mongoClient.session.findMany({
    where: { revokedAt: null, expiresAt: { gt: new Date() } },
  });
}

async function revokeSessionInDB(sessionId: string, replacedBy?: string) {
  return await mongoClient.session.update({
    where: { id: sessionId },
    data: { revokedAt: new Date(), replacedBy },
  });
}

async function rotateSessionInDB(oldSessionId: string, userId: string, newHash: string, newExpiresAt: Date, meta?: { ip?: string; ua?: string }) {
  return await mongoClient.$transaction([
    mongoClient.session.update({
      where: { id: oldSessionId },
      data: { revokedAt: new Date(), replacedBy: newHash },
    }),
    mongoClient.session.create({
      data: {
        userId,
        sessionIdHash: newHash,
        expiresAt: newExpiresAt,
      },
    }),
  ]);
}

export {
  createSessionInDB,
  findActiveSessions,
  revokeSessionInDB,
  rotateSessionInDB,
};
