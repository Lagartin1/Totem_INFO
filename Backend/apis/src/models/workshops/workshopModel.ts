import { mongoClient } from "@/database/mongodb";
import { Workshop } from "@prisma/client"; // Importamos el tipo generado por Prisma

// Eliminadas: las importaciones de 'es' y las constantes de contador

// --- Tipos de Respuesta (Ajustados para consistencia) ---
export type { Workshop };

// Renombramos ProyectoResult a WorkshopResult
export interface WorkshopResult {
    data: Workshop[]; // Mantenemos 'data' como en el original
    total: number;
}

const PAGE_SIZE = 6; // Mantenemos el tamaño de página original

// --- OPERACIONES DE LECTURA ---

// 1. GetWorkshops: Listado paginado (Reemplaza getWorkshops())
export async function GetWorkshops(from: number = 0, _pageSize?: number): Promise<WorkshopResult> {
    // Forzar tamaño de página a PAGE_SIZE (siempre 6)
    const take = PAGE_SIZE;

    const [data, total] = await mongoClient.$transaction([
        mongoClient.workshop.findMany({
            orderBy: { createdAt: 'desc' },
            skip: from,
            take,
        }),
        mongoClient.workshop.count(),
    ]);

    // Devuelve los items (máx. 6) y el total de items en la colección
    return { data, total };
}

// 2. GetWorkshopByID (Nuevo, necesario para las operaciones de Update/Delete en el Service)
export async function GetWorkshopByID(id: string): Promise<Workshop | null> {
    return await mongoClient.workshop.findUnique({
        where: { id }
    });
}

// --- OPERACIONES DE MUTACIÓN ---

// 3. CreateWorkshop (Reemplaza createWorkshop y solo acepta datos limpios, sin ID manual)
export async function CreateWorkshop(workshop: any): Promise<Workshop> {
    // El ID se genera automáticamente por MongoDB
    return await mongoClient.workshop.create({
        data: {
            ...workshop,
            visitas: 0, // Asumimos que se inicializa en 0
        }
    });
}

// 4. UpdateWorkshop (Reemplaza updateWorkshop y usa la sintaxis simple de Prisma)
export async function UpdateWorkshop(id: string, workshop: any): Promise<Workshop> {
    // Prisma usa el operador 'id' y el objeto 'data'
    const updatedWorkshop = await mongoClient.workshop.update({
        where: { id },
        data: workshop
    });
    return updatedWorkshop;
}

// 5. DeleteWorkshop (Reemplaza deleteWorkshop y usa la sintaxis simple de Prisma)
export async function DeleteWorkshop(id: string): Promise<Workshop> {
    // Prisma borra por el ID único
    const deletedWorkshop = await mongoClient.workshop.delete({
        where: { id }
    });
    return deletedWorkshop;
}

// ELIMINADAS: 
// - getNextWorkshopId(): Se elimina por completo.
// - getLastWorkshopId(): Se elimina por completo.