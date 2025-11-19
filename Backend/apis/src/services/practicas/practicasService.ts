import {PracticasResult,PracticaCSV,GetPracticas,GetPracticasByYear,SearchTermPracticas,CreateNewPractica,CreateBulkPracticas,DeletePracticaByID,desactivePracticaByID} from "@/models/practicas/practicasModel";

// Headers requeridos para la validación del CSV
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

const PAGE_SIZE = 10; // Definimos un tamaño de página por defecto para el servicio

export async function listPracticas(year: string | false, indice: number, type: string): Promise<PracticasResult> {
    console.log("listPracticas params:", { year, indice, type });
    
    // Llamamos a las funciones del modelo que ahora usan Prisma
    const practicasData = year
        ? await GetPracticasByYear(type, year, indice)
        : await GetPracticas(type, indice);

    if (!practicasData || practicasData.practicas.length === 0) {
        throw new Error("No se encontraron prácticas");
    }

    return practicasData;
}

// Actualizamos para aceptar 'indice' y soportar paginación en búsquedas
export async function BuscarPracticas(term: string, type: string, indice: number): Promise<PracticasResult> {
    const practicasData: PracticasResult = await SearchTermPracticas(term, type, indice, PAGE_SIZE);

    if (!practicasData || practicasData.practicas.length === 0) {
        throw new Error('No se encontraron prácticas');
    }
    return practicasData;
}


export async function insertNewPractica(data: any): Promise<PracticasResult> {
    // ELIMINADO: const lastID = await GetLastPracticaId(); 
    // Ahora Prisma genera el ID automáticamente
    const practicasData: PracticasResult = await CreateNewPractica(data);
    
    if (!practicasData) {
        throw new Error('No se pudo crear la práctica');
    }
    return practicasData;
}


export async function insertCsvPracticas(dataArray: any[]): Promise<PracticaCSV> {
    // ELIMINADO: const lastID = await GetLastPracticaId();
    // Pasamos directamente el array de datos limpios
    const practicasDataArray = await CreateBulkPracticas(dataArray) as PracticaCSV;
    
    if (!practicasDataArray || (practicasDataArray.total === 0 && practicasDataArray.errors.length > 0)) {
        throw new Error('No se pudieron crear las prácticas o hubo errores en la carga masiva');
    }
    return practicasDataArray;
}


// --- Funciones Utilitarias (Sin cambios lógicos, solo mantenemos la estructura) ---

export function csvToJson(csv: string): any[] {
    const rows: string[][] = [];
    let curRow: string[] = [];
    let curField = '';
    let inQuotes = false;

    for (let i = 0; i < csv.length; i++) {
        const ch = csv[i];

        if (ch === '"') {
            if (inQuotes && csv[i + 1] === '"') {
                curField += '"';
                i++; 
            } else {
                inQuotes = !inQuotes; 
            }
            continue;
        }

        if (ch === ',' && !inQuotes) {
            curRow.push(curField);
            curField = '';
            continue;
        }

        if ((ch === '\n' || ch === '\r') && !inQuotes) {
            if (ch === '\r' && csv[i + 1] === '\n') i++;
            curRow.push(curField);
            if (!(curRow.length === 1 && curRow[0] === '')) {
                rows.push(curRow);
            }
            curRow = [];
            curField = '';
            continue;
        }
        curField += ch;
    }

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
            // Validación simple para asegurar que campos requeridos no estén vacíos
            if ((key !== 'beneficios' && key !== 'requisitos_especiales') && (!item[key] || item[key].trim() === '')) {
                return false;
            }
        }
        return true;
    });
    return cleanedDataArray;    
}


export function validatePracticaData(data: any): boolean {
    if (!data || data.length === 0) return false;
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

export async function togglePracticaState(id: string): Promise<boolean | { error: string }> {
    try {
        const result = await desactivePracticaByID(id);
        if (typeof result === 'boolean') {
            return result;
        }
        return { error: 'Error al cambiar el estado de la práctica' };
    } catch (error) {
        console.error('Error al cambiar el estado de la práctica:', error);
        return { error: 'Error al cambiar el estado de la práctica' };
    }
}