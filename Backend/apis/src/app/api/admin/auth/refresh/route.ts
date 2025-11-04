// app/api/auth/refresh/route.ts
import { refreshController } from '@/controllers/admin/authController';
import { NextRequest } from 'next/server';



export async function GET(req: NextRequest) { return refreshController(req); }
