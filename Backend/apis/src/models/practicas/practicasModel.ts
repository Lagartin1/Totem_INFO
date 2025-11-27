import { mongoClient } from "@/database/mongodb";
import { Practica } from "@prisma/client"; // Importamos el tipo generado por Prisma
import { ObjectId } from "bson";

export type { Practica };

export interface PracticasResult {
  practicas: Practica[];
  total: number;
}

export interface PracticaCSV {
  total: number;
  errors: any[];
}

// --- CONSTANTES ---
const PAGE_SIZE = 6;

// 1. CreateNewPractica: Creación de una práctica
export async function CreateNewPractica(
  data: any,
  userId: string
): Promise<PracticasResult> {
  const practica = await mongoClient.practica.create({
    data: {
      ...data,
      visitas: 0, // Asumimos que inicializa en 0
      autorId: new ObjectId(userId).toString(),
    },
  });

  return {
    practicas: [practica],
    total: 1,
  };
}

export async function CreateBulkPracticas(
  dataArray: any[]
): Promise<PracticaCSV> {
  const creationPromises = dataArray.map((data) =>
    mongoClient.practica.create({
      data: {
        ...data,
        visitas: 0,
      },
    })
  );

  try {
    const results = await Promise.all(creationPromises);
    return {
      total: results.length,
      errors: [],
    };
  } catch (error) {
    console.error("Error en CreateBulkPracticas:", error);
    return {
      total: 0,
      errors: [{ message: "Fallo la inserción de datos masivos." }],
    };
  }
}

// 3. GetPracticas: Listado normal/paginado
export async function GetPracticas(
  type: string,
  indice: number,
  pageSize = PAGE_SIZE
): Promise<PracticasResult> {
  const filter: any = type !== "all" ? { tipo_practica: type } : {};

  const [practicas, total] = await mongoClient.$transaction([
    mongoClient.practica.findMany({
      where: filter,
      orderBy: { created_at: "desc" },
      skip: indice,
      take: pageSize,
    }),
    mongoClient.practica.count({ where: filter }),
  ]);

  return { practicas, total };
}


// 4a. GetPracticasByYear: solo obtiene los candidatos de la base de datos (sin paginar ni filtrar por preferencia)
export async function GetPracticasByYear(
  type: string,
  year: string
): Promise<any[]> {
  const start = new Date(parseInt(year), 0, 1);
  const end = new Date(parseInt(year) + 1, 0, 1);

  const typeFilter: any = type !== "all" ? { tipo_practica: type } : {};

  // Traemos candidatos que tengan cualquiera de las dos fechas dentro del rango.
  // Nota: `fechas_practica` se almacena como string, por lo que no podemos comparar con Date;
  // en su lugar filtramos por presencia del año en la cadena.
  const where: any = {
    ...typeFilter,
    OR: [
      { created_at: { gte: start, lt: end } },
      { fechas_practica: { contains: year } },
    ],
  };

  // Solo recuperación desde BD; la lógica de preferencia y paginación queda aparte.
  const candidates = await mongoClient.practica.findMany({
    where,
    orderBy: { created_at: "desc" },
  });

  return candidates;
}



export async function GetPracticaYears(tipo_practica: string): Promise<number[]> {
  const typeFilter: any = tipo_practica !== "all" ? { tipo_practica: tipo_practica } : {};

  const yearsData = await mongoClient.practica.findMany({
    where: typeFilter,
    select: {
      created_at: true,
      fechas_practica: true, // ahora también traemos el campo string
    },
  });

  const yearsSet = new Set<number>();
  const yearRegex = /\b(19|20)\d{2}\b/g;

  yearsData.forEach((item) => {
    if (item.created_at) {
      yearsSet.add(item.created_at.getFullYear());
    }

    const fechas = item.fechas_practica;
    if (fechas && typeof fechas === "string") {
      const matches = fechas.match(yearRegex);
      if (matches) {
        matches.forEach((m) => {
          const y = parseInt(m, 10);
          if (!isNaN(y)) yearsSet.add(y);
        });
      } else {
        // Si no se encontraron años con regex, intentar parsear la cadena como fecha completa
        const parsed = Date.parse(fechas);
        if (!isNaN(parsed)) {
          yearsSet.add(new Date(parsed).getFullYear());
        }
      }
    }
  });

  const yearsArray = Array.from(yearsSet).sort((a, b) => b - a); // Orden descendente
  return yearsArray;
}










// 5. SearchTermPracticas: Búsqueda por término
export async function SearchTermPracticas(
  term: string,
  type: string,
  indice: number,
  pageSize = PAGE_SIZE
): Promise<PracticasResult> {
  const typeFilter: any = type !== "all" ? { tipo_practica: type } : {};

  // Filtro de búsqueda en múltiples campos de texto (simulando búsqueda ES)
  const searchFilter = {
    OR: [
      { nombre_empresa: { contains: term, mode: "insensitive" } },
      { labores: { contains: term, mode: "insensitive" } },
      { beneficios: { contains: term, mode: "insensitive" } },
      { requisitos_especiales: { contains: term, mode: "insensitive" } },
      { marca_temporal: { contains: term, mode: "insensitive" } },
    ],
  };

  const filter = {
    ...typeFilter,
    ...searchFilter,
  };

  const [practicas, total] = await mongoClient.$transaction([
    mongoClient.practica.findMany({
      where: filter,
      orderBy: { created_at: "desc" },
      skip: indice,
      take: pageSize,
    }),
    mongoClient.practica.count({ where: filter }),
  ]);

  return { practicas, total };
}

// 6. GetPracticasByID: Obtener una práctica por ID
export async function GetPracticasByID(id: string): Promise<PracticasResult> {
  const practica = await mongoClient.practica.findUnique({
    where: { id: id },
  });

  if (!practica) {
    return { practicas: [], total: 0 };
  }

  return { practicas: [practica], total: 1 };
}

// --- OPERACIONES DE ACTUALIZACIÓN / ELIMINACIÓN ---

// 7. incrementPracticasVisits: Incrementar contador de visitas
export async function incrementPracticasVisits(id: string): Promise<boolean> {
  try {
    await mongoClient.practica.update({
      where: { id: id },
      data: {
        visitas: { increment: 1 }, // Usando el operador atómico de MongoDB
      },
    });
    return true;
  } catch (error) {
    console.error("Error incrementando visitas:", error);
    return false;
  }
}

// 8. desactivePracticaByID: Cambiar el estado (toggle)
export async function desactivePracticaByID(id: string): Promise<boolean> {
  try {
    const current = await mongoClient.practica.findUnique({
      where: { id: id },
      select: { state: true },
    });

    if (!current) {
      return false;
    }

    await mongoClient.practica.update({
      where: { id: id },
      data: {
        state: !current.state,
      },
    });
    return true;
  } catch (error) {
    console.error("Error al cambiar estado:", error);
    return false;
  }
}

// 9. DeletePracticaByID: Eliminar una práctica
export async function DeletePracticaByID(id: string): Promise<boolean> {
  try {
    await mongoClient.practica.delete({
      where: { id: id },
    });
    return true;
  } catch (error) {
    console.error("Error al eliminar práctica:", error);
    return false;
  }
}

// 10. getTopPracticas: Obtener las N prácticas más visitadas
export async function getTopPracticas(limit: number): Promise<Practica[]> {
  const practicas = await mongoClient.practica.findMany({
    orderBy: { visitas: "desc" },
    take: limit,
    where: { state: true }, // Asumimos que solo queremos las activas
  });
  return practicas;
}
