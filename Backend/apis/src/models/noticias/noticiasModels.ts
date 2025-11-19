import { mongoClient } from "@/database/mongodb";
import { Noticia } from "@prisma/client"; 
import { Prisma } from "@prisma/client";

// Eliminadas: las importaciones de 'es', 'writeFile', 'unlink', 'path', y 'randomUUID'

// --- Tipos de Respuesta (Ajustados para consistencia) ---
export type { Noticia };

export interface NoticiaResult {
    noticias: Noticia[];
    total: number;
}

const PAGE_SIZE = 20; // Mantenemos el size original de 20 para el listado por defecto

// --- OPERACIONES DE LECTURA ---

// 1. GetNoticias: Listado paginado (Reemplaza GetNoticias() original)
export async function GetNoticias(indice: number = 0, pageSize: number = PAGE_SIZE): Promise<NoticiaResult> {
    const [noticias, total] = await mongoClient.$transaction([
        mongoClient.noticia.findMany({
            orderBy: { fecha_publicacion: 'desc' },
            skip: indice,
            take: pageSize,
        }),
        mongoClient.noticia.count(),
    ]);

    return { noticias, total };
}

// 2. GetNoticiaByID (Nuevo, necesario para el Service para la gestión de imágenes y el update/delete)
export async function GetNoticiaByID(id: string): Promise<Noticia | null> {
    return await mongoClient.noticia.findUnique({
        where: { id }
    });
}

// 3. SearchNoticias (Nuevo, para la búsqueda de texto)
export async function SearchNoticias(term: string, indice: number = 0, pageSize: number = PAGE_SIZE): Promise<NoticiaResult> {
    // Simulamos la búsqueda multi-match de ES con OR y filtro 'contains' (insensible a mayúsculas)
    const searchFilter = {
        OR: [
            { titulo: { contains: term, mode: Prisma.QueryMode.insensitive } },
            { contenido: { contains: term, mode: Prisma.QueryMode.insensitive } },
            { descripcion: { contains: term, mode: Prisma.QueryMode.insensitive } },
            { autor_externo: { contains: term, mode: Prisma.QueryMode.insensitive } },
            { categoria: { contains: term, mode: Prisma.QueryMode.insensitive } },
        ]
    };

    const [noticias, total] = await mongoClient.$transaction([
        mongoClient.noticia.findMany({
            where: searchFilter,
            orderBy: { fecha_publicacion: 'desc' },
            skip: indice,
            take: pageSize,
        }),
        mongoClient.noticia.count({ where: searchFilter }),
    ]);

    return { noticias, total };
}

// --- OPERACIONES DE MUTACIÓN ---

// 4. CreateNoticia (Reemplaza CreateNoticia(formData) y solo acepta datos limpios)
export async function CreateNoticia(data: any): Promise<Noticia> {
    // La lógica de ID incremental y manejo de FormData fue eliminada.
    return await mongoClient.noticia.create({
        data: {
            ...data,
            visitas: 0, // Asumimos que se inicializa en 0
        }
    });
}

// 5. UpdateNoticia (Reemplaza UpdateNoticia(id, formData) y solo acepta datos limpios)
export async function UpdateNoticia(id: string, data: any): Promise<Noticia> {
    return await mongoClient.noticia.update({
        where: { id },
        data: data
    });
}

// 6. DeleteNoticia (Reemplaza DeleteNoticia(id) y solo borra de la DB)
export async function DeleteNoticia(id: string): Promise<Noticia> {
    return await mongoClient.noticia.delete({
        where: { id }
    });
}

// ELIMINADA: DeleteIndiceNoticias (Elasticsearch específico)