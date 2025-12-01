import { mongoClient } from "@/database/mongodb";
import { Proyecto, Prisma } from "@prisma/client"; // Importamos el tipo generado por Prisma

// Eliminadas: las importaciones de 'es', 'writeFile', 'unlink', 'path', y 'randomUUID'

// --- Tipos de Respuesta (Ajustados para consistencia) ---
export type { Proyecto };

export interface ProyectoResult {
    proyectos: Proyecto[];
    total: number;
}

const PAGE_SIZE = 10; // Tamaño de página por defecto

// --- OPERACIONES DE LECTURA ---

// 1. GetProyectos: Listado paginado (Reemplaza getProyectos y GetProyectosModel)
export async function GetProyectos(indice: number = 0, pageSize: number = PAGE_SIZE): Promise<ProyectoResult> {
    const [proyectos, total] = await mongoClient.$transaction([
        mongoClient.proyecto.findMany({
            orderBy: { createdAt: 'desc' }, // Ordenar por fecha de creación
            skip: indice,
            take: pageSize,
        }),
        mongoClient.proyecto.count(),
    ]);

    return { proyectos, total };
}

// 2. GetProyectoByID (Necesario para las operaciones de Update/Delete en el Service)
export async function GetProyectoByID(id: string): Promise<Proyecto | null> {
    return await mongoClient.proyecto.findUnique({
        where: { id }
    });
}

// 3. SearchProyectos: Búsqueda de texto (Reemplaza searchProyectos)
export async function SearchProyectos(searchTerm: string, indice: number = 0, pageSize: number = PAGE_SIZE): Promise<ProyectoResult> {
    // Simulamos la búsqueda multi-match de ES con OR y filtro 'contains'
    const searchFilter: Prisma.ProyectoWhereInput = {
        OR: [
            { titulo: { contains: searchTerm, mode: 'insensitive' } },
            { descripcion: { contains: searchTerm, mode: 'insensitive' } },
            { area_desarrollo: { contains: searchTerm, mode: 'insensitive' } },
            { autores: { has: searchTerm } } // Si 'autores' es un array, se busca si contiene el término
        ]
    };

    const [proyectos, total] = await mongoClient.$transaction([
        mongoClient.proyecto.findMany({
            where: searchFilter,
            orderBy: { createdAt: 'desc' },
            skip: indice,
            take: pageSize,
        }),
        mongoClient.proyecto.count({ where: searchFilter }),
    ]);

    return { proyectos, total };
}

// 4. SearchProyectoValidYear: Búsqueda por año (Reemplaza searchProyectoValidYear)
export async function SearchProyectoValidYear(year: number, indice: number = 0, pageSize: number = PAGE_SIZE): Promise<ProyectoResult> {
    // Filtro por rango de fechas para el año de publicación
    const start = new Date(`${year}-01-01`);
    const end = new Date(`${year + 1}-01-01`);

    const whereClause = {
        fecha_publicacion: {
            gte: start,
            lt: end,
        },
    };

    const [proyectos, total] = await mongoClient.$transaction([
        mongoClient.proyecto.findMany({
            where: whereClause,
            orderBy: { fecha_publicacion: 'desc' },
            skip: indice,
            take: pageSize,
        }),
        mongoClient.proyecto.count({ where: whereClause }),
    ]);

    return { proyectos, total };
}

// --- OPERACIONES DE MUTACIÓN ---

// 5. CreateProyecto (Reemplaza createProyectoModel y solo acepta datos limpios)
export async function CreateProyecto(data: any): Promise<Proyecto> {
    return await mongoClient.proyecto.create({
        data: {
            ...data,
        }
    });
}

// 6. UpdateProyecto (Reemplaza PutProyectoModel y solo acepta datos limpios)
export async function UpdateProyecto(id: string, data: any): Promise<Proyecto> {
    return await mongoClient.proyecto.update({
        where: { id },
        data: data
    });
}

// 7. DeleteProyecto (Reemplaza DeleteProyectoModel y solo borra de la DB)
export async function DeleteProyecto(id: string): Promise<Proyecto> {
    return await mongoClient.proyecto.delete({
        where: { id }
    });
}