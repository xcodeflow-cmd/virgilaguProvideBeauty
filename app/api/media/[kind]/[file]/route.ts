import { createReadStream } from "fs";
import { readFile, stat } from "fs/promises";
import path from "path";
import { Readable } from "stream";

import { NextResponse } from "next/server";

const mediaRoots = {
  gallery: path.join(process.cwd(), "assets", "gallery"),
  videos: path.join(process.cwd(), "assets", "videos")
} as const;

function getContentType(filename: string) {
  const extension = path.extname(filename).toLowerCase();

  switch (extension) {
    case ".jpg":
    case ".jpeg":
      return "image/jpeg";
    case ".png":
      return "image/png";
    case ".webp":
      return "image/webp";
    case ".mp4":
      return "video/mp4";
    default:
      return "application/octet-stream";
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ kind: keyof typeof mediaRoots; file: string }> }
) {
  const { kind, file } = await params;
  const root = mediaRoots[kind];

  if (!root) {
    return new NextResponse("Not found", { status: 404 });
  }

  const resolvedPath = path.resolve(root, file);

  if (!resolvedPath.startsWith(root)) {
    return new NextResponse("Invalid path", { status: 400 });
  }

  try {
    const contentType = getContentType(file);
    const range = request.headers.get("range");

    if (contentType === "video/mp4" && range) {
      const fileStats = await stat(resolvedPath);
      const fileSize = fileStats.size;
      const matches = /bytes=(\d+)-(\d*)/.exec(range);

      if (!matches) {
        return new NextResponse("Invalid range", { status: 416 });
      }

      const start = Number(matches[1]);
      const end = matches[2] ? Number(matches[2]) : fileSize - 1;

      if (!Number.isFinite(start) || !Number.isFinite(end) || start < 0 || end >= fileSize || start > end) {
        return new NextResponse("Invalid range", { status: 416 });
      }

      const stream = createReadStream(resolvedPath, { start, end });

      return new NextResponse(Readable.toWeb(stream) as ReadableStream, {
        status: 206,
        headers: {
          "Content-Type": contentType,
          "Content-Length": String(end - start + 1),
          "Content-Range": `bytes ${start}-${end}/${fileSize}`,
          "Accept-Ranges": "bytes",
          "Cache-Control": "public, max-age=31536000, immutable"
        }
      });
    }

    const buffer = await readFile(resolvedPath);

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable"
      }
    });
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }
}
