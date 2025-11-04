import {registerService} from "@/services/admin/registerService";
import { NextRequest, NextResponse } from "next/server";

export async function registerController(req: NextRequest) {
  try {
    const { username, email, password, nombre, apellido } = await req.json().catch(() => ({} as any));
    if (!username || !email || !password || !nombre || !apellido) {
      return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 });
    }
    const result = await registerService({ username, email, password, nombre, apellido })
    if (!result.ok) {
      return NextResponse.json({ error: 'Error al registrar el usuario' }, { status: 500 });
    }
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message || 'Error interno del servidor' }, { status: 500 });
  }
}

