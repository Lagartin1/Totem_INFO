
import { NextRequest } from "next/server";
import { adminWorkshopController } from "@/controllers/workshop/workshopController";



export async function PUT(req: NextRequest) {
  return adminWorkshopController('PUT', req);
}

export async function POST(req: NextRequest) {
  return adminWorkshopController('POST', req);
}

export async function DELETE(req: NextRequest) {
  return adminWorkshopController('DELETE', req);
}