
import { NextRequest, NextResponse } from "next/server";
import { registeredController } from "@/controllers/admin/registeredController";

export async function GET(req: NextRequest) { return registeredController(req) }

