import { Router, Request, Response } from "express";
import multer from "multer";
import path from "path";
import { randomUUID } from "crypto";
import fs from "fs";

const UPLOADS_DIR = path.resolve(process.cwd(), "public/uploads");
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOADS_DIR),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${randomUUID()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 200 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const ok = /\.(jpg|jpeg|png|gif|webp|avif|svg|mp4|webm|mov)$/i.test(file.originalname);
    ok ? cb(null, true) : cb(new Error("Only image or video files are allowed"));
  },
});

const router = Router();

/* ── Upload ─────────────────────────────────────────────────────── */
router.post("/upload", upload.single("file"), (req: Request, res: Response) => {
  if (!req.file) {
    res.status(400).json({ error: "bad_request", message: "No file uploaded" });
    return;
  }
  res.status(201).json({ url: `/api/media/${req.file.filename}` });
});

/* ── Serve media ─────────────────────────────────────────────────
   Express sendFile handles:
   - Correct Content-Type for every extension (jpg, gif, mp4, webm, mov…)
   - Range / 206 Partial Content for video streaming (iOS Safari, Android)
   - 200 full-file for images and GIFs
   - 404 when the file doesn't exist
   ─────────────────────────────────────────────────────────────── */
router.get("/media/:filename", (req: Request, res: Response) => {
  const filename = path.basename(req.params.filename); // strip any path traversal
  const filePath = path.join(UPLOADS_DIR, filename);

  res.sendFile(filePath, { dotfiles: "deny" }, (err) => {
    if (err) {
      const status = (err as NodeJS.ErrnoException).code === "ENOENT" ? 404 : 500;
      if (!res.headersSent) {
        res.status(status).json({ error: status === 404 ? "not_found" : "server_error" });
      }
    }
  });
});

export default router;
