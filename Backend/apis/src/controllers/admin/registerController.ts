import {acceptRegisterService, registerService} from "@/services/admin/registerService";
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyAccessToken } from "@/lib/auth/login_tools";


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

export async function acceptRegisterController(req: NextRequest) {
  try {
    const jar = await cookies();
    const token = jar.get('access_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (!(await verifyAccessToken(token))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { userId } = await req.json().catch(() => ({} as any));
    if (!userId) {
      return NextResponse.json({ error: 'ID de usuario inválido' }, { status: 400 });
    }
    const result = await acceptRegisterService(userId);
    if (!result.ok) {
      return NextResponse.json({ error: 'Error al aceptar el registro del usuario' }, { status: 500 });
    }
    return NextResponse.json({ ok: true, userId: result.userId }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message || 'Error interno del servidor' }, { status: 500 });
  }
}
