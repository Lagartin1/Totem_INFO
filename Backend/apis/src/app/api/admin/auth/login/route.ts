// app/api/auth/login/route.ts
import { loginController } from '@/controllers/admin/authController';


export async function POST(req: Request) { return loginController(req); }
