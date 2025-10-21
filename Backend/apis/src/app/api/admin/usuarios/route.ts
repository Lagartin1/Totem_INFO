import { NextResponse } from "next/server";
import { createUser } from "@/services/admin/usuarioService";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const user = await createUser({
      nombre: body.nombre,
      apellido: body.apellido,
      email: body.email,
      username: body.username,
      password: body.password,
    });

    return NextResponse.json(user, { status: 201 });
  } catch (error: any) {
    console.error("❌ Error al crear usuario:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
