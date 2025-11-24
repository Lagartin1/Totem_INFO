import { CreateWorkshop, DeleteWorkshop, GetWorkshops, UpdateWorkshop, WorkshopResult,Workshop } from "@/models/workshops/workshopModel";
import { NextRequest, NextResponse } from "next/server";
import { addLogEntry } from "../admin/logs"; 

const PAGE_SIZE = 6; // Mantenemos el tamaño de página definido en el Modelo

export async function getAllWorkshopsFromDbService(pagina?: string): Promise<WorkshopResult> { 
    // Calculamos el índice de inicio ('skip' en Prisma)
    const pageNumber = Number(pagina) > 1 ? Number(pagina) : 1;
    const indice = (pageNumber - 1) * PAGE_SIZE;
    console.log(`Fetching workshops for page ${pageNumber}, skip index ${indice}`);

    // Llamamos al nuevo modelo con el índice y el tamaño de página
    const workshops = await GetWorkshops(indice, PAGE_SIZE);

    if (!workshops) {
        throw new Error("No se pudieron obtener los workshops");
    }
    return workshops;
} 


// AÑADIDO: 'userId' para la autoría (autorId en Prisma)
export async function createWorkshopInDb(req: NextRequest, userId: string): Promise<Workshop> {
    const workshop = await req.json().catch(() => ({} as any)); 
    
    // ELIMINADO: const id = await getNextWorkshopId();
    
    // AÑADIMOS el autorId al objeto de datos
    const workshopData = {
        ...workshop,
        autorId: userId // Campo obligatorio para Prisma
    };
    
    // Llamamos a la función de creación, que ahora solo espera el objeto
    const result = await CreateWorkshop(workshopData);

    if (!result) {
        throw new Error("No se pudo crear el workshop");
    }

    // El log ahora usa el ID generado por MongoDB (result.id, que es un string)
    await addLogEntry(
        userId, 
        'create_workshop', 
        `Creó un workshop con ID ${result.id} con los datos: ${JSON.stringify(workshop)}`
    );
    return result;
} 

// Nota: Ahora espera un ID de tipo string (MongoDB ObjectId)
export async function updateWorkshopInDb(req: NextRequest, userId: string): Promise<Workshop> {
    const { id, ...workshop } = await req.json().catch(() => ({} as any));
    
    // El ID debe ser string (MongoDB ObjectId)
    if (!id || typeof id !== 'string') {
         throw new Error("ID de workshop inválido");
    }

    // Llamamos al modelo que espera el ID (string) y los datos
    const result = await UpdateWorkshop(id, workshop);

    if (!result) {
        throw new Error("No se pudo actualizar el workshop");
    }

    // El log usa el ID de MongoDB
    await addLogEntry(
        userId, 
        'update_workshop', 
        `Actualizó el workshop con ID ${id} con los datos: ${JSON.stringify(workshop)}`
    );
    return result;
}

// Nota: Ahora espera un ID de tipo string (MongoDB ObjectId)
export async function deleteWorkshopInDb(req: NextRequest, userId: string): Promise<Workshop> {
    const { id } = await req.json().catch(() => ({} as any));

    // El ID debe ser string (MongoDB ObjectId)
    if (!id || typeof id !== 'string') {
         throw new Error("ID de workshop inválido");
    }
    
    // Llamamos al modelo que espera el ID (string)
    const result = await DeleteWorkshop(id);

    if (!result) {
        throw new Error("No se pudo eliminar el workshop");
    }

    // El log usa el ID de MongoDB
    await addLogEntry(
        userId, 
        'delete_workshop', 
        `Eliminó el workshop con ID ${id}`
    );
    return result;
}