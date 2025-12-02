import { NextRequest, NextResponse } from "next/server";
import { PracticasResult, GetPracticasByID, incrementPracticasVisits, SearchTermPracticas,getTopPracticas } from "@/models/practicas/practicasModel";
import { listPracticas, insertNewPractica, insertCsvPracticas, csvToJson, CleanArray, validatePracticaData, deletePractica, togglePracticaState,GetAvailablePracticaYears } from "@/services/practicas/practicasService";
import { addLogEntry } from "@/models/admin/logModel";

const PAGE_SIZE = 10;

export async function fetchPracticas(
  year: string | false,
  indice: number,
  tipo_practica: string,
  searchTerm: string | null
): Promise<PracticasResult> {

  try {
    let data: PracticasResult;

    if (searchTerm) {
      // 1. Búsqueda por término (Ahora usa Prisma con filtro 'contains')
      data = await SearchTermPracticas(searchTerm, tipo_practica, indice, PAGE_SIZE);
    } else if (year) {
      // 2. Filtro por año
      data = await listPracticas(year, indice, tipo_practica);
    } else {
      // 3. Listado normal (a través del servicio)
      data = await listPracticas(false, indice, tipo_practica);
    }
    return data;

  } catch (error) {
    console.error("Error en fetchPracticas (controlador):", error);
    // CORRECCIÓN: Eliminamos la mención a Elasticsearch
    throw new Error("Error al consultar la base de datos desde el controlador");
  }
}

export async function fetchYearsPracticas(tipo_practica: string) {
    try {
        // Usamos el modelo para obtener los años disponibles
        const years = await GetAvailablePracticaYears(tipo_practica);
        return years;
    } catch (error) {
        console.error("Error en fetchYearsPracticas:", error);
        throw new Error("Error al obtener los años de prácticas");
    }
}   




export async function adminController(req: NextRequest, infotype: string, userID: string) {
    try {
        if (infotype === 'form') {
            // --- Creación Manual ---
            const body = await req.json().catch(() => ({} as any));
            const result = await insertNewPractica(body, userID);
            
            if (!result) {
                return new NextResponse(JSON.stringify({ error: 'No se pudo crear la práctica' }), { status: 500 });
            }
            
            await addLogEntry(userID, 'create_practica', 'practica');
            return new NextResponse(JSON.stringify({ ok: true }), { status: 201 });

        } else if (infotype === 'file') {
            // --- Carga Masiva por CSV ---
            const formData = await req.formData();
            const file = formData.get("file");

            if (!file || !(file instanceof File)) {
                return NextResponse.json(
                    { error: "No se recibió el archivo en el campo 'file'" },
                    { status: 400 }
                );
            }

            const fileContent = await file.text();
            const dataArray = csvToJson(fileContent);
            
            // Validaciones del CSV
            const isValid = validatePracticaData(dataArray);
            if (!isValid) {
                return new NextResponse(JSON.stringify({ error: 'El archivo CSV no tiene el formato correcto' }), { status: 400 });
            }
            
            const cleanedDataArray = CleanArray(dataArray);
            const resultArray = await insertCsvPracticas(cleanedDataArray,userID);

            if (!resultArray) {
                return new NextResponse(JSON.stringify({ error: 'No se pudieron crear las prácticas' }), { status: 500 });
            }

            await addLogEntry(userID, 'upload_practicas_csv', 'practicas', `${file.name}`);
            
            return new NextResponse(JSON.stringify({ 
                ok: true,
                practicas: resultArray.total
            }), { status: 201 });

        } else {
            return new NextResponse(JSON.stringify({ error: 'Tipo de información no válido' }), { status: 400 });
        }
    } catch (error) {
        console.error(error);
        return new NextResponse(JSON.stringify({ error: 'Error interno del servidor' }), { status: 500 });
    }
}

export async function adminDeletePractica(req: NextRequest, userID: string) {
    try {
        const body = await req.json().catch(() => ({} as any));
        // Usamos el servicio que a su vez llama al modelo de Prisma
        const result = await deletePractica(body.id);
   
        if (!result) {
            return new NextResponse(JSON.stringify({ error: 'No se pudo eliminar la práctica' }), { status: 500 });
        }

        await addLogEntry(userID, 'delete_practica', 'practica');
        return new NextResponse(JSON.stringify({ ok: true }), { status: 200 });

    } catch (error) {
        console.error(error);
        return new NextResponse(JSON.stringify({ error: 'Error interno del servidor' }), { status: 500 });
    }
} 

export async function desactivarPractica(req: NextRequest, userID: string) {
    try {
        const body = await req.json().catch(() => ({} as any));
        const result = await togglePracticaState(body.id as string);

        if (!result) {
            return new NextResponse(JSON.stringify({ error: 'No se pudo cambiar el estado' }), { status: 500 });
        }
        // Verificamos si el servicio devolvió un objeto de error
        if (result && typeof result === 'object' && 'error' in result) {
            return new NextResponse(JSON.stringify({ error: result.error }), { status: 400 });
        }

        await addLogEntry(userID, 'deactivate_practica', `practica id: {${body.id}}`);
        return new NextResponse(JSON.stringify({ ok: true }), { status: 200 });

    } catch (error) {
        console.error(error);
        return new NextResponse(JSON.stringify({ error: 'Error interno del servidor' }), { status: 500 });
    }
}   

export async function getTopClickedPracticas() {
  // Obtiene las N más visitadas usando Prisma
  const result = await getTopPracticas(PAGE_SIZE); 
  return NextResponse.json(result);
}

export async function getPracticaDetails(id: string) {
    try {
        // Incremento y Log (Async, no bloqueante)
        incrementPracticasVisits(id).catch(console.error);
        addLogEntry('system_user', 'view_practica', 'practica', id).catch(console.error);

        // Obtener detalles por ID
        const practicaResult = await GetPracticasByID(id);

        if (!practicaResult || practicaResult.total === 0) {
            return new NextResponse(
                JSON.stringify({ error: "Práctica no encontrada" }), 
                { status: 404 }
            );
        }

        return new NextResponse(
            JSON.stringify(practicaResult.practicas[0]), 
            { status: 200 }
        );

    } catch (error) {
        console.error("Error en getPracticaDetails:", error);
        return new NextResponse(
            JSON.stringify({ error: "Error interno del servidor" }), 
            { status: 500 }
        );
    }
}