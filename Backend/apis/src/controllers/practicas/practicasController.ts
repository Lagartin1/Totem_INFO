import { PracticasResult, GetPracticasByID, incrementPracticasVisits, GetPracticasByYear, SearchTermPracticas} from "@/models/practicas/practicasModel";
import { listPracticas, insertNewPractica, insertCsvPracticas,csvToJson,CleanArray,validatePracticaData, deletePractica, togglePracticaState} from "@/services/practicas/practicasService";
import { NextRequest,NextResponse } from "next/server";
import { getTopPracticas } from "@/models/practicas/practicasModel";
import { addLogEntry } from "@/models/admin/logModel";

export async function fetchPracticas(
  year: string | false,
  indice: number,
  tipo_practica: string,
  searchTerm: string | null // <-- 4. Añadimos el término de búsqueda
): Promise<PracticasResult> {

  try {
    let data;

    if (searchTerm) {
      // Si hay búsqueda
      data = await SearchTermPracticas(searchTerm, tipo_practica, indice, 10);
    } else if (year) {
      // Si hay filtro por año
      data = await GetPracticasByYear(tipo_practica, year, indice, 10);
    } else {
      // Si es listado normal (tu caso actual)
      data = await listPracticas(false, indice, tipo_practica);
    }
    return data;

  } catch (error) {
    console.error("Error en fetchPracticas (controlador):", error);
    // Lanza el error para que la ruta lo atrape en su try/catch
    throw new Error("Error al consultar Elasticsearch desde el controlador");
  }
}




export async function adminController(req: NextRequest,infotype: string, userID: string) {
    try{
        if (infotype === 'form') {
            const body = await req.json().catch(() => ({} as any)) 
            const result = await insertNewPractica(body);
            if (!result) {
                return new NextResponse(JSON.stringify({ error: 'No se pudo crear la práctica' }), { status: 500 });
            }
            // agregar registro de actividad aquí en la base de datos de usuarios
            await addLogEntry(userID, 'create_practica', 'practica');
            //
            return new NextResponse(JSON.stringify({ ok: true }), { status: 201 });
        } else if (infotype === 'file') {
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
            const isValid = validatePracticaData(dataArray);
            if (!isValid) {
                return new NextResponse(JSON.stringify({ error: 'El archivo CSV no contiene el formato o las cabeceras necesarias' }), { status: 400 });
            }
            const cleanedDataArray = CleanArray(dataArray);
            const resultArray = await insertCsvPracticas(cleanedDataArray);
            if (!resultArray) {
                return new NextResponse(JSON.stringify({ error: 'No se pudieron crear las prácticas' }), { status: 500 });
            }
            // agregar registro de actividad aquí en la base de datos de usuarios  
            await addLogEntry(userID, 'upload_practicas_csv', 'practicas', `${file.name}`);
            //
            return new NextResponse(JSON.stringify({ ok: true,
                practicas: resultArray.total
            }), { status: 201 });
        }else{
            return new NextResponse(JSON.stringify({ error: 'Tipo de información no válido' }), { status: 400 });
        }
    } catch (error) {
        console.error(error);
        return new NextResponse(JSON.stringify({ error: 'Error interno del servidor' }), { status: 500 });
    }
}



export async function adminDeletePractica(req: NextRequest,userID: string) {
    try{    
        const body = await req.json().catch(() => ({} as any))
        const result = await deletePractica(body.id);
   
        if (!result) {
            return new NextResponse(JSON.stringify({ error: 'No se pudo eliminar la práctica' }), { status: 500 });
        }

        // guardar registro de actividad aquí en la base de datos de usuarios
        await addLogEntry(userID, 'delete_practica', 'practica');
        

        return new NextResponse(JSON.stringify({ ok: true }), { status: 200 });

    }
    catch (error) {
        console.error(error);
        return new NextResponse(JSON.stringify({ error: 'Error interno del servidor' }), { status: 500 });
    }
} 


export async function desactivarPractica(req: NextRequest,userID: string) {
    try{    
        const body = await req.json().catch(() => ({} as any))
        const result = await togglePracticaState(body.id as string);
        if (!result) {
            return new NextResponse(JSON.stringify({ error: 'No se pudo desactivar la práctica' }), { status: 500 });
        }
        if (result && typeof result === 'object' && result.error) {
            return new NextResponse(JSON.stringify({ error: result.error }), { status: 400 });
        }
        // guardar registro de actividad aquí en la base de datos de usuarios
        await addLogEntry(userID, 'deactivate_practica', 'practica id:{ '+body.id+'}');
        return new NextResponse(JSON.stringify({ ok: true }), { status: 200 });

    }
    catch (error) {
        console.error(error);
        return new NextResponse(JSON.stringify({ error: 'Error interno del servidor' }), { status: 500 });
    }
}   

export async function getTopClickedPracticas() {
  // Llama a la nueva función del modelo
  const result = await getTopPracticas(10); 
  return NextResponse.json(result);
}

export async function getPracticaDetails(id: string) {
    try {
        incrementPracticasVisits(id).catch(console.error);
        addLogEntry('system_user', 'view_practica', 'practica', id).catch(console.error);

        // 3. Obtiene y devuelve los datos
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