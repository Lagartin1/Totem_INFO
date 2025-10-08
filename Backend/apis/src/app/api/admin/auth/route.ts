// app/api/auth/csrf/route.ts
import { NextResponse } from 'next/server';
import { issueCsrfToken } from '@/lib/auth/login_tools';

export async function GET() {
  try {
    const csrfToken = await issueCsrfToken();

    const res = NextResponse.json({ csrf: csrfToken });

    const isProd = process.env.NODE_ENV === 'production';
    res.cookies.set({
      name: 'csrf_token',
      value: csrfToken,
      httpOnly: false,                 // visible para leerlo en el cliente/Postman
      secure: isProd,                  // en dev: false si usas http://
      sameSite: isProd ? 'strict' : 'lax', // en dev: 'lax' ayuda con orígenes/puertos distintos
      path: '/',
      maxAge: 60 * 15,
    });


    return res;
  } catch (error) {
    console.error('Error issuing CSRF token:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
