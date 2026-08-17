import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { put } from "@vercel/blob";
import { SESSION_COOKIE_NAME, verifySession } from "@/lib/auth";

export const runtime = "nodejs";

const MAX_SIZE_BYTES = 8 * 1024 * 1024; // 8 MB
const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
]);

function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9.\-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export async function POST(request: Request) {
  const c = await cookies();
  const session = verifySession(c.get(SESSION_COOKIE_NAME)?.value);
  if (!session) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json(
      {
        error:
          "Image uploads aren't configured on this deployment yet. Ask the site tech to enable Vercel Blob and set BLOB_READ_WRITE_TOKEN.",
      },
      { status: 503 }
    );
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid upload." }, { status: 400 });
  }

  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file received." }, { status: 400 });
  }
  if (!ALLOWED_TYPES.has(file.type)) {
    return NextResponse.json(
      { error: "Only JPEG, PNG, WebP, GIF, or AVIF images are allowed." },
      { status: 400 }
    );
  }
  if (file.size > MAX_SIZE_BYTES) {
    const mb = (MAX_SIZE_BYTES / (1024 * 1024)).toFixed(0);
    return NextResponse.json(
      { error: `Image is too large — max ${mb} MB.` },
      { status: 413 }
    );
  }

  const originalName = file.name || "upload";
  const dot = originalName.lastIndexOf(".");
  const stem = dot > 0 ? originalName.slice(0, dot) : originalName;
  const ext = dot > 0 ? originalName.slice(dot + 1) : "";
  const safeStem = slugify(stem) || "image";
  const safeExt = slugify(ext).slice(0, 5);
  const pathname = `courses/${Date.now()}-${safeStem}${safeExt ? `.${safeExt}` : ""}`;

  try {
    const blob = await put(pathname, file, {
      access: "public",
      contentType: file.type,
      addRandomSuffix: false,
    });
    return NextResponse.json({ url: blob.url, pathname: blob.pathname });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Upload failed.";
    console.error("[admin/upload] failed:", message);
    return NextResponse.json(
      { error: `Upload failed: ${message}` },
      { status: 502 }
    );
  }
}
