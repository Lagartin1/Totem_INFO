import { NextRequest, NextResponse } from "next/server";
import { createWorkshopInDb, deleteWorkshopInDb, getAllWorkshopsFromDb, updateWorkshopInDb } from "@/services/workshops/workshopsService";
import { cookies } from "next/headers";
import { verifyAccessToken,getUserIdFromSessionToken } from "@/lib/auth/login_tools";


export async function workshopController(req: NextRequest) {
  const pagina = req.nextUrl.searchParams.get('pagina') || '1';
  const workshops = await getAllWorkshopsFromDb(pagina);
  if (!workshops) {
    return NextResponse.json(
      { message: "No se encontraron workshops" },
      { status: 404 }
    );
  }
  return NextResponse.json({ ok: true, data: workshops }, { status: 200 });
}



export async function adminWorkshopController(type: 'GET' | 'POST' | 'PUT' | 'DELETE',req:NextRequest, workshop?: any, id?: number) {
  const jar = await cookies();
  const token = jar.get('access_token')?.value;
  const sessionToken = jar.get('refresh_token')?.value;
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (!(await verifyAccessToken(token))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  const userId = await getUserIdFromSessionToken(sessionToken || '');
  const userIdNumber = userId ? parseInt(userId) : null;
  
  if (!userIdNumber) {
    return NextResponse.json({ error: 'Invalid user ID' }, { status: 401 });
  }
  try{
    switch (type) {
      case 'POST':
      const createdWorkshop = await createWorkshopInDb(req,userIdNumber);
      if (!createdWorkshop) {
        return NextResponse.json({ message: "No se pudo crear el workshop" }, { status: 500 });
      }
      return NextResponse.json({ ok: true, data: createdWorkshop }, { status: 201 });

      case 'PUT':
        const updatedWorkshop =  await updateWorkshopInDb(req,userIdNumber);
        if (!updatedWorkshop) {
          return NextResponse.json({ message: "No se pudo actualizar el workshop" }, { status: 500 });
        }
        return NextResponse.json({ ok: true, data: updatedWorkshop }, { status: 200 });

      case 'DELETE':
        const deletedWorkshop = await deleteWorkshopInDb(req,userIdNumber);
        if (!deletedWorkshop) {
          return NextResponse.json({ message: "No se pudo eliminar el workshop" }, { status: 500 });
        }
        return NextResponse.json({ ok: true, data: deletedWorkshop }, { status: 200 });

      default:
        return NextResponse.json({ message: "Método no permitido" }, { status: 405 });
    }
  }catch(error:any){
    return NextResponse.json({ message: error.message || "Error del servidor" }, { status: 500 });  

  }
}