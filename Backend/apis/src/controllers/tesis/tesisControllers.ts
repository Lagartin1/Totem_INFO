
import { TesisResponse } from '@/models/tesis/tesisModels';
import {listTesis,SearchTerm  } from '@/services/tesis/tesisService';


export async function tesisController(searchTerm: string|false) {
    let response: TesisResponse;
    if (!searchTerm) {
        response = await listTesis();
    } else {
        response = await SearchTerm(searchTerm);
    }
    if (!response) {
        throw new Error("Error fetching tesis data");
    }
    return response;
}
