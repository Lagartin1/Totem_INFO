import { NextResponse } from "next/server";

export interface ControllerResponse<T = unknown> {
  status: number;
  body?: T | null;
  headers?: Record<string, string>;
}

export function toNextResponse<T>(response: ControllerResponse<T>) {
  const { status, body, headers } = response;

  if (body === null && (status === 204 || status === 205)) {
    return new NextResponse(null, { status, headers });
  }

  if (body === undefined) {
    return NextResponse.json(null, { status, headers });
  }

  if (body === null) {
    return NextResponse.json(body, { status, headers });
  }

  return NextResponse.json(body, { status, headers });
}
