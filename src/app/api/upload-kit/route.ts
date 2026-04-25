import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir, readFile } from "fs/promises";
import { existsSync } from "fs";
import path from "path";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "kits");
const META_FILE = path.join(UPLOAD_DIR, "kits-meta.json");

const ALLOWED_EXTENSIONS = [".zip", ".tar.gz", ".sh", ".py", ".json", ".txt", ".yml", ".yaml"];

interface KitMeta {
  id: string;
  name: string;
  originalName: string;
  size: number;
  uploadedAt: string;
  description: string;
}

async function ensureUploadDir() {
  if (!existsSync(UPLOAD_DIR)) {
    await mkdir(UPLOAD_DIR, { recursive: true });
  }
}

async function readMeta(): Promise<KitMeta[]> {
  try {
    const data = await readFile(META_FILE, "utf-8");
    return JSON.parse(data);
  } catch {
    return [];
  }
}

async function writeMeta(meta: KitMeta[]) {
  await writeFile(META_FILE, JSON.stringify(meta, null, 2));
}

function isAllowedFile(filename: string): boolean {
  const lower = filename.toLowerCase();
  return ALLOWED_EXTENSIONS.some((ext) => lower.endsWith(ext));
}

export async function POST(request: NextRequest) {
  try {
    await ensureUploadDir();

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const description = (formData.get("description") as string) || "";

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No file provided" },
        { status: 400 }
      );
    }

    if (!isAllowedFile(file.name)) {
      return NextResponse.json(
        { success: false, error: `Invalid file type. Allowed: ${ALLOWED_EXTENSIONS.join(", ")}` },
        { status: 400 }
      );
    }

    const id = `kit-${Date.now()}-${Math.random().toString(36).substr(2, 8)}`;
    const safeName = `${id}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
    const filePath = path.join(UPLOAD_DIR, safeName);

    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(filePath, buffer);

    const meta = await readMeta();
    const newKit: KitMeta = {
      id,
      name: safeName,
      originalName: file.name,
      size: file.size,
      uploadedAt: new Date().toISOString(),
      description,
    };
    meta.unshift(newKit);
    await writeMeta(meta);

    return NextResponse.json({
      success: true,
      data: newKit,
      downloadUrl: `/uploads/kits/${safeName}`,
    });
  } catch (error) {
    console.error("Upload kit error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to upload kit" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const meta = await readMeta();
    return NextResponse.json({ success: true, data: meta });
  } catch (error) {
    console.error("Get kits error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch kits" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Kit ID is required" },
        { status: 400 }
      );
    }

    const meta = await readMeta();
    const kit = meta.find((k) => k.id === id);

    if (!kit) {
      return NextResponse.json(
        { success: false, error: "Kit not found" },
        { status: 404 }
      );
    }

    const filePath = path.join(UPLOAD_DIR, kit.name);
    if (existsSync(filePath)) {
      const { unlink } = await import("fs/promises");
      await unlink(filePath);
    }

    const updatedMeta = meta.filter((k) => k.id !== id);
    await writeMeta(updatedMeta);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete kit error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete kit" },
      { status: 500 }
    );
  }
}

