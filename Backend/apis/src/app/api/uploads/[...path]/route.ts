import { NextRequest } from "next/server";
import fs from "fs";
import path from "path";
import { Readable } from "stream";

export const runtime = "nodejs";

function getContentType(filePath: string) {
  const ext = path.extname(filePath).toLowerCase();
  switch (ext) {
    case ".jpg":
    case ".jpeg":
      return "image/jpeg";
    case ".png":
      return "image/png";
    case ".gif":
      return "image/gif";
    case ".webp":
      return "image/webp";
    case ".svg":
      return "image/svg+xml";
    case ".mp4":
      return "video/mp4";
    case ".webm":
      return "video/webm";
    case ".ogg":
      return "video/ogg";
    case ".pdf":
      return "application/pdf";
    default:
      return "application/octet-stream";
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: { path?: string[] } }
) {
  try {
    const awaitedParams = await params;
    const parts = awaitedParams?.path || [];
    if (parts.length === 0) {
      return new Response("No file specified", { status: 400 });
    }

    // Prevent directory traversal
    const safeParts = parts.map((p) => p.replace(/\.\.+/g, ""));
    const relPath = path.join(...safeParts);
    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    const filePath = path.join(uploadsDir, relPath);

    if (!filePath.startsWith(uploadsDir)) {
      // attempted escape
      return new Response("Forbidden", { status: 403 });
    }

    if (!fs.existsSync(filePath)) {
      return new Response("Not found", { status: 404 });
    }

    const stat = await fs.promises.stat(filePath);
    const rangeHeader = req.headers.get("range");
    const contentType = getContentType(filePath);

    if (rangeHeader) {
      // Handle range requests for video streaming
      const matches = rangeHeader.match(/bytes=(\d*)-(\d*)/);
      let start = 0;
      let end = stat.size - 1;
      if (matches) {
        if (matches[1]) start = parseInt(matches[1], 10);
        if (matches[2]) end = parseInt(matches[2], 10);
      }
      if (start > end || start < 0 || end >= stat.size) {
        return new Response("Range Not Satisfiable", { status: 416 });
      }

      const chunkSize = end - start + 1;
      const nodeStream = fs.createReadStream(filePath, { start, end });
      const stream = Readable.toWeb(nodeStream);
      const headers = new Headers();
      headers.set("Content-Range", `bytes ${start}-${end}/${stat.size}`);
      headers.set("Accept-Ranges", "bytes");
      headers.set("Content-Length", String(chunkSize));
      headers.set("Content-Type", contentType);

      return new Response(stream as any, { status: 206, headers });
    }

    // No range: stream whole file
    const nodeStream = fs.createReadStream(filePath);
    const stream = Readable.toWeb(nodeStream);
    const headers = new Headers();
    headers.set("Content-Type", contentType);
    headers.set("Content-Length", String(stat.size));

    return new Response(stream as any, { status: 200, headers });
  } catch (err) {
    console.error("Error serving upload:", err);
    return new Response("Internal Server Error", { status: 500 });
  }
}
