import { mongoClient } from "@/database/mongodb";
import { Gira, Prisma } from "@prisma/client"; // Importamos el tipo generado por Prisma

// Eliminadas: las importaciones de 'es', 'writeFile', 'unlink', 'path', y 'randomUUID'

// --- Tipos de Respuesta ---
export type { Gira };

export interface GiraResult {
    giras: Gira[];
    total: number;
}

const PAGE_SIZE = 6;

// --- OPERACIONES DE LECTURA ---

// 1. GetGiras: Listado paginado (Reemplaza getGiras() y GetGirasModel())
export async function GetGiras(indice: number = 0, pageSize: number = PAGE_SIZE): Promise<GiraResult> {
    const take = PAGE_SIZE;

    const [giras, total] = await mongoClient.$transaction([
        mongoClient.gira.findMany({
            orderBy: { createdAt: 'desc' }, // O por el campo 'anio' si es preferible
            skip: indice,
            take,
        }),
        mongoClient.gira.count(),
    ]);

    return { giras, total };
}

// 2. GetGiraByID (Nuevo, necesario para update/delete en el Service)
export async function GetGiraByID(id: string): Promise<Gira | null> {
    return await mongoClient.gira.findUnique({
        where: { id }
    });
}

// 3. SearchGiras (Nueva función para búsqueda básica por texto/año)
export async function SearchGiras(term: string, indice: number = 0, pageSize: number = PAGE_SIZE): Promise<GiraResult> {
    const searchFilter: Prisma.GiraWhereInput = {
        OR: [
            { titulo: { contains: term, mode: 'insensitive' as Prisma.QueryMode } },
            { descripcion: { contains: term, mode: 'insensitive' as Prisma.QueryMode } },
            { anio: { contains: term, mode: 'insensitive' as Prisma.QueryMode } }, 
        ]
    };

    const [giras, total] = await mongoClient.$transaction([
        mongoClient.gira.findMany({
            where: searchFilter,
            orderBy: { createdAt: 'desc' },
            skip: indice,
            take: pageSize,
        }),
        mongoClient.gira.count({ where: searchFilter }),
    ]);

    return { giras, total };
}

// --- OPERACIONES DE MUTACIÓN ---

// 4. CreateGira (Reemplaza createGiraModel y solo acepta datos limpios)
export async function CreateGira(data: any): Promise<Gira> {
    return await mongoClient.gira.create({
        data: {
            ...data,
        }
    });
}

// 5. UpdateGira (Reemplaza PutGiraModel y solo acepta datos limpios)
export async function UpdateGira(id: string, data: any): Promise<Gira> {
    return await mongoClient.gira.update({
        where: { id },
        data: data
    });
}

// 6. DeleteGira (Reemplaza DeleteGiraModel y solo borra de la DB)
export async function DeleteGira(id: string): Promise<Gira> {
    return await mongoClient.gira.delete({
        where: { id }
    });
}