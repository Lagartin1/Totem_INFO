import { PracticasResult} from "@/models/practicas/practicasModel";
import { listPracticas, BuscarPracticas ,insertNewPractica, insertCsvPracticas,csvToJson,CleanArray,validatePracticaData} from "@/services/practicas/practicasService";
import { NextRequest,NextResponse } from "next/server";

import { addLogEntry } from "@/models/admin/logModel";





export async function fetchPracticas(year: string | false,indice: number, type: string): Promise<PracticasResult> {

    const practicasData: PracticasResult= await listPracticas(year, indice, type);

    if (!practicasData) {
        throw new Error('No se encontraron prácticas');
    }
    return practicasData;
}



export async function SearchTermPracticas(term: string, type: string): Promise<PracticasResult> {

    const practicasData: PracticasResult = await BuscarPracticas(term, type);

    if (!practicasData) {
        throw new Error('No se encontraron prácticas');
    }
    return practicasData;
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



