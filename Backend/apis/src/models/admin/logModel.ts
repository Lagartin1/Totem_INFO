
import { mongoClient } from '@/database/mongodb';



export async function addLogEntry(  usuarioId: string, action: string, resource?: string, details?: unknown, userAgent?: string): Promise<any> {
  const data: any = {
    action,
    timestamp: new Date(),
    usuarioId,
  };
  if (resource !== undefined) data.resource = resource;
  if (details !== undefined) data.details = details;
  if (userAgent !== undefined) data.userAgent = userAgent;

  return await mongoClient.registro.create({ data });
}