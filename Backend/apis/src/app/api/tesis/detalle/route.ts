import { NextResponse, NextRequest } from 'next/server';
import { getTesisDetails } from '@/controllers/tesis/tesisControllers';


export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    return await getTesisDetails(id);

  } catch (error) {
    console.error(error);
    return new NextResponse(
      JSON.stringify({ error: "Error interno del servidor" }), 
      { status: 500 }
    );
  }
}