import { NextRequest } from 'next/server';
import { getTopClickedPracticas } from '@/controllers/practicas/practicasController';

export async function GET(req: NextRequest) {
  return await getTopClickedPracticas();
}