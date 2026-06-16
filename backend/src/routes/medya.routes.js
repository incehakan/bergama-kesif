const express = require("express");
const router = express.Router();
const multer = require("multer");
const MulterError = require("multer").MulterError;
const path = require("path");
const fs = require("fs");
const { authMiddleware } = require("../middleware/auth.middleware");

const UPLOAD_ROOT = path.join(__dirname, "..", "..", "uploads");
["fotograflar", "videolar", "vr-360"].forEach((dir) => {
  fs.mkdirSync(path.join(UPLOAD_ROOT, dir), { recursive: true });
});

const VIDEO_EXT = [".mp4", ".mov", ".avi", ".m4v", ".webm"];

function safeOriginalName(file) {
  const raw = file && typeof file.originalname === "string" ? file.originalname : "";
  return raw.trim() || "dosya";
}

const storage = multer.diskStorage({
  destination(req, file, cb) {
    try {
      const name = safeOriginalName(file);
      const ext = path.extname(name).toLowerCase();
      const klasor = VIDEO_EXT.includes(ext) ? "videolar" : "fotograflar";
      cb(null, path.join(UPLOAD_ROOT, klasor));
    } catch (e) {
      cb(e);
    }
  },
  filename(req, file, cb) {
    try {
      const name = safeOriginalName(file);
      const ext = path.extname(name).toLowerCase();
      const base = path
        .basename(name, ext)
        .replace(/[^a-z0-9]/gi, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "")
        .toLowerCase();
      const safeBase = base || "dosya";
      cb(null, `${Date.now()}-${safeBase}${ext}`);
    } catch (e) {
      cb(e);
    }
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 500 * 1024 * 1024 },
});

/** Multer'ı Express zincirine bağla; beklenmeyen hataları next(err) ile ilet */
function multerDosya(req, res, next) {
  upload.single("dosya")(req, res, (err) => {
    if (err) {
      if (err instanceof MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
          return res.status(400).json({ error: "Dosya çok büyük (en fazla 500 MB)" });
        }
        return res.status(400).json({ error: err.message || "Dosya yükleme hatası" });
      }
      return next(err);
    }
    next();
  });
}

router.use((req, res, next) => {
  if ((req.originalUrl || req.url || "").includes("medya")) {
    process.stdout.write(`[medya] ${req.method} ${req.originalUrl || req.url}\n`);
  }
  next();
});

router.post("/yukle", authMiddleware, multerDosya, (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Dosya bulunamadı" });
    }
    const name = safeOriginalName(req.file);
    const ext = path.extname(name).toLowerCase();
    const tip = VIDEO_EXT.includes(ext) ? "video" : "fotograf";
    const klasor = tip === "video" ? "videolar" : "fotograflar";
    const url = `/uploads/${klasor}/${req.file.filename}`;
    return res.json({ url, tip });
  } catch (e) {
    return next(e);
  }
});

console.log("[kesif] medya.routes yüklendi");

module.exports = router;
