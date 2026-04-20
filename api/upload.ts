import { randomUUID } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import type { VercelRequest, VercelResponse } from "@vercel/node";
import formidable from "formidable";
import { getSupabaseAdminStorageClient, requireAdmin } from "./_lib/auth.js";
import { methodNotAllowed, sendJson } from "./_lib/http.js";

const MAX_UPLOAD_BYTES = Number.parseInt(
  process.env.UPLOAD_MAX_BYTES ?? "",
  10,
) || 4 * 1024 * 1024;

const ALLOWED_EXTENSIONS = new Set([
  ".jpg",
  ".jpeg",
  ".png",
  ".gif",
  ".webp",
  ".avif",
  ".svg",
  ".mp4",
  ".webm",
  ".mov",
]);

const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/avif",
  "image/svg+xml",
  "video/mp4",
  "video/webm",
  "video/quicktime",
]);

const MIME_TO_EXTENSION: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/gif": ".gif",
  "image/webp": ".webp",
  "image/avif": ".avif",
  "image/svg+xml": ".svg",
  "video/mp4": ".mp4",
  "video/webm": ".webm",
  "video/quicktime": ".mov",
};

export const config = {
  api: {
    bodyParser: false,
  },
};

function parseForm(req: VercelRequest) {
  const form = formidable({
    multiples: false,
    maxFileSize: MAX_UPLOAD_BYTES,
    allowEmptyFiles: false,
  });

  return new Promise<{
    fields: formidable.Fields;
    files: formidable.Files;
  }>((resolve, reject) => {
    form.parse(req, (error, fields, files) => {
      if (error) reject(error);
      else resolve({ fields, files });
    });
  });
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
) {
  if (req.method !== "POST") {
    return methodNotAllowed(res, ["POST"]);
  }

  const admin = await requireAdmin(req, res);
  if (!admin) return;

  let tempFilePath: string | null = null;

  try {
    const { files } = await parseForm(req);
    const rawFile = files.file;
    const file = Array.isArray(rawFile) ? rawFile[0] : rawFile;

    if (!file) {
      console.error("Upload request missing file payload", {
        hasFilesObject: Boolean(files),
        fileKeys: Object.keys(files || {}),
      });
      return sendJson(res, 400, {
        error: "bad_request",
        message: "No file uploaded",
      });
    }

    tempFilePath = file.filepath;

    let ext = path.extname(file.originalFilename ?? "").toLowerCase();
    const mimeType = String(file.mimetype ?? "").toLowerCase();
    if (!ext && MIME_TO_EXTENSION[mimeType]) {
      ext = MIME_TO_EXTENSION[mimeType];
    }

    if (!ALLOWED_MIME_TYPES.has(mimeType) || !ALLOWED_EXTENSIONS.has(ext)) {
      console.error("Upload rejected by file type validation", {
        mimeType,
        ext,
        originalFilename: file.originalFilename,
      });
      return sendJson(res, 400, {
        error: "bad_request",
        message: "Only image or video files are allowed",
      });
    }

    const bytes = await fs.readFile(file.filepath);
    if (bytes.byteLength > MAX_UPLOAD_BYTES) {
      return sendJson(res, 413, {
        error: "payload_too_large",
        message: `Upload size exceeds the ${Math.floor(MAX_UPLOAD_BYTES / (1024 * 1024))}MB limit`,
      });
    }

    const bucket = process.env.SUPABASE_STORAGE_BUCKET || "uploads";
    const objectPath = `${randomUUID()}${ext || ".bin"}`;

    const supabase = getSupabaseAdminStorageClient();
    const { error } = await supabase.storage
      .from(bucket)
      .upload(objectPath, bytes, {
        contentType: mimeType || "application/octet-stream",
        upsert: false,
      });

    if (error) {
      console.error("Supabase storage upload failed", {
        error,
        bucket,
        objectPath,
        mimeType,
        size: bytes.byteLength,
      });
      return sendJson(res, 500, {
        error: "upload_failed",
        message: error.message,
      });
    }

    const { data } = supabase.storage.from(bucket).getPublicUrl(objectPath);
    if (!data?.publicUrl) {
      console.error("Supabase storage did not return public URL", {
        bucket,
        objectPath,
      });
      return sendJson(res, 500, {
        error: "upload_failed",
        message: "Uploaded file but failed to resolve its public URL",
      });
    }

    return sendJson(res, 201, {
      url: data.publicUrl,
      publicUrl: data.publicUrl,
      path: objectPath,
    });
  } catch (error: any) {
    if (error?.code === 1009 || error?.httpCode === 413) {
      return sendJson(res, 413, {
        error: "payload_too_large",
        message: `Upload size exceeds the ${Math.floor(MAX_UPLOAD_BYTES / (1024 * 1024))}MB limit`,
      });
    }

    console.error("Unhandled upload failure", {
      error,
      name: error?.name,
      code: error?.code,
      message: error?.message,
    });

    return sendJson(res, 500, {
      error: "internal_error",
      message: "Failed to upload file",
    });
  } finally {
    if (tempFilePath) {
      await fs.unlink(tempFilePath).catch(() => {});
    }
  }
}
