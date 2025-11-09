import { NextRequest } from 'next/server';
import { workshopController } from '@/controllers/workshop/workshopController';

export async function GET(request: NextRequest) {
  return  workshopController(request);
}