import { mongoClient } from "@/database/mongodb";
import { Becado, Prisma } from "@prisma/client"; // Importamos el tipo generado por Prisma

// Eliminadas: las importaciones de 'es', 'writeFile', 'unlink', 'path', y 'randomUUID'

// --- Tipos de Respuesta (Ajustados para consistencia) ---
export type { Becado };

export interface BecadosResult {
    becados: Becado[];
    total: number;
}

const PAGE_SIZE = 10;

// --- OPERACIONES DE LECTURA ---

// 1. GetBecados: Listado paginado (Reemplaza GetBecados() original)
export async function GetBecados(indice: number = 0, pageSize: number = PAGE_SIZE): Promise<BecadosResult> {
    // Usamos $transaction para obtener los datos y el conteo total en una sola llamada eficiente
    const [becados, total] = await mongoClient.$transaction([
        mongoClient.becado.findMany({
            orderBy: { fecha_publicacion: 'desc' },
            skip: indice,
            take: pageSize,
        }),
        mongoClient.becado.count(),
    ]);

    return { becados, total };
}

// 2. GetBecadoByID (Nuevo, esencial para el Service para operaciones de actualización/eliminación)
export async function GetBecadoByID(id: string): Promise<Becado | null> {
    return await mongoClient.becado.findUnique({
        where: { id }
    });
}

// 3. SearchBecado: Búsqueda de texto (Reemplaza SearchBecado(searchTerm) original de ES)
export async function SearchBecado(searchTerm: string, indice: number = 0, pageSize: number = PAGE_SIZE): Promise<BecadosResult> {
    const searchFilter: Prisma.BecadoWhereInput = {
        OR: [
            { nombre: { contains: searchTerm, mode: 'insensitive' } },
            { titulo: { contains: searchTerm, mode: 'insensitive' } },
            { descripcion: { contains: searchTerm, mode: 'insensitive' } },
        ]
    };

    const [becados, total] = await mongoClient.$transaction([
        mongoClient.becado.findMany({
            where: searchFilter,
            orderBy: { fecha_publicacion: 'desc' },
            skip: indice,
            take: pageSize,
        }),
        mongoClient.becado.count({ where: searchFilter }),
    ]);

    return { becados, total };
}

// 4. SearchBecadoYear: Búsqueda por año (Reemplaza SearchBecadoYear(searchTerm, year) original de ES)
export async function SearchBecadoYear(searchTerm: string, year: number, indice: number = 0, pageSize: number = PAGE_SIZE): Promise<BecadosResult> {
    const start = new Date(`${year}-01-01`);
    const end = new Date(`${year + 1}-01-01`);

    const whereClause: any = {
        fecha_publicacion: {
            gte: start,
            lt: end,
        },
    };
    
    // Si hay un término de búsqueda, lo incluimos en el filtro
    if (searchTerm && searchTerm.trim() !== '') {
         whereClause.OR = [
            { nombre: { contains: searchTerm, mode: 'insensitive' } },
            { titulo: { contains: searchTerm, mode: 'insensitive' } },
            { descripcion: { contains: searchTerm, mode: 'insensitive' } },
        ];
    }

    const [becados, total] = await mongoClient.$transaction([
        mongoClient.becado.findMany({
            where: whereClause,
            orderBy: { fecha_publicacion: 'desc' },
            skip: indice,
            take: pageSize,
        }),
        mongoClient.becado.count({ where: whereClause }),
    ]);

    return { becados, total };
}

// --- OPERACIONES DE MUTACIÓN (CREACIÓN, ACTUALIZACIÓN, ELIMINACIÓN) ---

// 5. CreateBecado (Reemplaza createBecadoModel y solo acepta datos limpios, sin FormData)
export async function CreateBecado(data: any): Promise<Becado> {
    return await mongoClient.becado.create({
        data: {
            ...data,
            visitas: 0, 
        }
    });
}

// 6. UpdateBecado (Reemplaza PutBecadoModel y solo acepta datos limpios, sin FormData)
export async function UpdateBecado(id: string, data: any): Promise<Becado> {
    return await mongoClient.becado.update({
        where: { id },
        data: data
    });
}

// 7. DeleteBecado (Reemplaza DeleteBecadoModel y solo borra de la DB)
export async function DeleteBecado(id: string): Promise<Becado> {
    return await mongoClient.becado.delete({
        where: { id }
    });
}
