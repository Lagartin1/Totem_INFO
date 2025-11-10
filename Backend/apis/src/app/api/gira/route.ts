// Debes exportar al menos un método (GET, POST, etc.)
export async function GET(request: Request) {
  // Tu lógica aquí...
  return Response.json({ message: "Hello from /api/gira" });
}