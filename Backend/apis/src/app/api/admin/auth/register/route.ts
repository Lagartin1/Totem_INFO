import { NextRequest, NextResponse } from "next/server";
import { registerController } from "@/controllers/admin/registerController";
export async function POST(req: NextRequest) { return registerController(req) }
