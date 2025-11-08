import { register } from 'module';
import { NextRequest, NextResponse } from 'next/server';
import { acceptRegisterController } from '@/controllers/admin/registerController';


export async function PUT(req:NextRequest) {
  return acceptRegisterController(req);
}