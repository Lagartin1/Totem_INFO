// app/api/auth/refresh/route.ts
import { refreshController } from '@/controllers/admin/authController';



export async function POST() { return refreshController(); }
