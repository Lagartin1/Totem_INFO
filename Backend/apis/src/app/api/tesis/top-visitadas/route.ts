import { NextRequest, NextResponse } from 'next/server';
import { getTopClickedTesis } from '@/controllers/tesis/tesisControllers';

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const startDate = searchParams.get('startDate') || undefined;
  const endDate = searchParams.get('endDate') || undefined;
  
  return await getTopClickedTesis(startDate, endDate);
}
