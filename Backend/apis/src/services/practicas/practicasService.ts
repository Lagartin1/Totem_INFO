
import {DeletePracticaByID, GetPracticas, GetPracticasByYear,SearchTermPracticas} from "@/models/practicas/practicasModel";
import { PracticasResult, PracticaCSV} from "@/models/practicas/practicasModel";
import {CreateNewPractica, GetLastPracticaId,CreateBulkPracticas,GetPracticasByID} from "@/models/practicas/practicasModel";


const requiredHeaders = [
                'marca_temporal',
                'tipo_practica',
                'nombre_contacto',
                'cargo_contacto',
                'correo_contacto',
                'telefono_contacto',
                'nombre_empresa',
                'sitio_web_empresa',
                'unidad_empresa',
                'fechas_practica',
                'modalidad',
                'sede_practica',
                'regimen_trabajo',
                'labores',
                'beneficios',
                'requisitos_especiales'
            ];

export async function listPracticas(year: string | false,indice: number, type: string): Promise<PracticasResult> {
    let practicasData: PracticasResult;
    if (year) {
        practicasData = await GetPracticasByYear(indice, type, year);   
    } else {
        practicasData = await GetPracticas(indice, type);
    }   

    if (!practicasData) {
        throw new Error('No se encontraron prácticas');
    }
    return practicasData;
}

export async function BuscarPracticas(term: string, type: string): Promise<PracticasResult>{
    const practicasData: PracticasResult = await SearchTermPracticas(term, type);

    if (!practicasData) {
        throw new Error('No se encontraron prácticas');
    }
    return practicasData;

}


export async function insertNewPractica(data: any): Promise<PracticasResult> {
    const lastID = await GetLastPracticaId();
    const practicasData: PracticasResult = await CreateNewPractica(data,lastID);
    if (!practicasData) {
        throw new Error('No se pudo crear la práctica');
    }
    //const review:PracticasResult= await GetPracticasByID(practicasData.practicas[0].id);
   // if (!review) {
    //    throw new Error('No se pudo obtener la práctica');
   // }
    //console.log("Review:", review);
    return practicasData;
}



export async function insertCsvPracticas(dataArray: any[]): Promise<PracticaCSV> {
    const lastID = await GetLastPracticaId();   
    const practicasDataArray = await CreateBulkPracticas(dataArray,lastID) as PracticaCSV;
    if (!practicasDataArray) {
        throw new Error('No se pudieron crear las prácticas');
    }
    return practicasDataArray;
}



export function csvToJson(csv: string): any[] {
    const rows: string[][] = [];
    let curRow: string[] = [];
    let curField = '';
    let inQuotes = false;

    for (let i = 0; i < csv.length; i++) {
        const ch = csv[i];

        if (ch === '"') {
            // Escaped quote inside quoted field
            if (inQuotes && csv[i + 1] === '"') {
                curField += '"';
                i++; // skip the escaped quote
            } else {
                inQuotes = !inQuotes; // toggle quote state
            }
            continue;
        }

        if (ch === ',' && !inQuotes) {
            curRow.push(curField);
            curField = '';
            continue;
        }

        if ((ch === '\n' || ch === '\r') && !inQuotes) {
            // Handle CRLF
            if (ch === '\r' && csv[i + 1] === '\n') i++;
            curRow.push(curField);
            // skip entirely empty trailing line
            if (!(curRow.length === 1 && curRow[0] === '')) {
                rows.push(curRow);
            }
            curRow = [];
            curField = '';
            continue;
        }

        curField += ch;
    }

    // push last field/row if any
    if (curField !== '' || curRow.length > 0) {
        curRow.push(curField);
        if (!(curRow.length === 1 && curRow[0] === '')) {
            rows.push(curRow);
        }
    }

    if (rows.length === 0) return [];

    const headers = rows.shift()!.map(h => h.trim());
    const result = rows.map(row => {
        const obj: any = {};
        for (let j = 0; j < headers.length; j++) {
            let value = row[j] ?? '';
            value = value.trim();
            obj[headers[j]] = value;
        }
        return obj;
    });

    return result;
}


export function CleanArray(dataArray: any[]): any[] {
     const cleanedDataArray = dataArray.filter((item) => {
                for (const key of requiredHeaders) {
                    if ((key !== 'beneficios' && key !== 'requisitos_especiales') && (!item[key] || item[key].trim() === '')) {
                        return false;
                    }
                }
                return true;
            });
            return cleanedDataArray;    
}


export function validatePracticaData(data: any): boolean {
    const fileHeaders = Object.keys(data[0]);
    const hasAllHeaders = requiredHeaders.every(header => fileHeaders.includes(header));
    if (!hasAllHeaders) {
        console.error('El archivo CSV no contiene el formato o las cabeceras necesarias');
        return false;
    }
    return true;
}

export function deletePractica(id: string): Promise<boolean> {
    
    return DeletePracticaByID(id);
    
}   