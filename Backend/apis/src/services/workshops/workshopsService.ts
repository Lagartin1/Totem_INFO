
import { createWorkshop, deleteWorkshop,getNextWorkshopId,getWorkshops, updateWorkshop } from "@/models/workshops/workshopModel";
import { NextRequest, NextResponse } from "next/server";
import { addLogEntry } from "../admin/logs";
export async function getAllWorkshopsFromDb(pagina?: string) { 
  const indice = Number(pagina) > 1 ? (Number(pagina) - 1)*10: 0;
  const workshops = await getWorkshops(indice);
  if (!workshops) {
    throw new Error("No se pudieron obtener los workshops");
  }
  return workshops;

} 


export async function createWorkshopInDb(req: NextRequest, userId: number) {
  const workshop = await req.json().catch(() => ({} as any)) 
  const id = await getNextWorkshopId();
  const result = await createWorkshop(workshop, id);
  if (!result) {
    throw new Error("No se pudo crear el workshop");
  }
  // guardar en el log que el usuario con userId creo un workshop
  await addLogEntry(userId, 'create_workshop', `Creó un workshop con ID ${result._id} con los datos: ${JSON.stringify(workshop)}`);
  return result;
} 

export async function updateWorkshopInDb(req: NextRequest, userId: number) {
  const { id, ...workshop } = await req.json().catch(() => ({} as any))
  const result = await updateWorkshop(id, workshop);
  if (!result) {
    throw new Error("No se pudo actualizar el workshop");
  }
  // guardar en el log que el usuario con userId actualizo un workshop
  await addLogEntry(userId, 'update_workshop', `Actualizó el workshop con ID ${id} con los datos: ${JSON.stringify(workshop)}`);
  return result;
}

export async function deleteWorkshopInDb(req: NextRequest, userId: number) {
  const { id } = await req.json().catch(() => ({} as any))
  const result = await deleteWorkshop(id);
  if (!result) {
    throw new Error("No se pudo eliminar el workshop");
  }
  // guardar en el log que el usuario con userId elimino un workshop
  await addLogEntry(userId, 'delete_workshop', `Eliminó el workshop con ID ${id}`);
  return result;
}