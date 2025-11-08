
import { mongoClient } from '@/database/mongodb';


// Database operations
async function createSessionInDB(userId: string, tokenHash: string, expiresAt: Date, meta?: { ip?: string; ua?: string }) {
  const revokedAt = null;
  return await mongoClient.session.create({
    data: {
      userId,
      sessionIdHash: tokenHash,
      expiresAt,
      revokedAt,
    },
  });
}

async function findActiveSessions() {
  return await mongoClient.session.findMany({
    where: {
      revokedAt: null,
      expiresAt: {
        gt: new Date(),
      },
    },
  });
}

async function revokeSessionInDB(sessionId: string, replacedBy?: string) {
  return await mongoClient.session.update({
    where: { id: sessionId },
    data: { revokedAt: new Date(), replacedBy },
  });
}

async function rotateSessionInDB(oldSessionId: string, userId: string, newHash: string, newExpiresAt: Date, meta?: { ip?: string; ua?: string }) {
  console.log('hash in Rotating session DB:', {newHash}); // --- IGNORE ---
  
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
        revokedAt: null,
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
