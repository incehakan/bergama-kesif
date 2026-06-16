const path = require("path");
const fs = require("fs");
const multer = require("multer");

const UPLOAD_ROOT = path.join(__dirname, "..", "..", "uploads");

["fotograflar", "videolar", "vr-360"].forEach((dir) => {
  fs.mkdirSync(path.join(UPLOAD_ROOT, dir), { recursive: true });
});

const SUB = {
  FOTO: "fotograflar",
  VIDEO: "videolar",
  VR360: "vr-360",
};

const FOTO_EXT = new Set([".jpg", ".jpeg", ".png", ".webp"]);
const VR_EXT = new Set([".jpg", ".jpeg", ".png"]);
const VIDEO_EXT = new Set([".mp4", ".mov", ".avi"]);

const MAX_VIDEO = 500 * 1024 * 1024;
const MAX_FOTO = 10 * 1024 * 1024;

function ensureDirs() {
  ["fotograflar", "videolar", "vr-360"].forEach((dir) => {
    fs.mkdirSync(path.join(UPLOAD_ROOT, dir), { recursive: true });
  });
}

function extOf(file) {
  return path.extname(file.originalname || "").toLowerCase();
}

function sanitizeBaseName(file) {
  const ext = extOf(file);
  const base = path.basename(file.originalname || "dosya", ext);
  return (
    base
      .replace(/[^\w\u00C0-\u024F.-]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "")
      .toLowerCase() || "dosya"
  );
}

function resolveSubdir(req, file) {
  const ext = extOf(file);
  const tip = String(req.body?.tip || "").trim().toLowerCase();

  if (tip === "vr360") {
    return VR_EXT.has(ext) ? SUB.VR360 : null;
  }
  if (tip === "video" || VIDEO_EXT.has(ext)) {
    return VIDEO_EXT.has(ext) ? SUB.VIDEO : null;
  }
  if (tip === "fotograf" || FOTO_EXT.has(ext)) {
    return FOTO_EXT.has(ext) ? SUB.FOTO : null;
  }
  return null;
}

const storage = multer.diskStorage({
  destination(req, file, cb) {
    try {
      ensureDirs();
      const sub = resolveSubdir(req, file);
      if (!sub) {
        return cb(
          new Error("Geçersiz dosya tipi veya tip alanı (tip: fotograf | video | vr360)")
        );
      }
      cb(null, path.join(UPLOAD_ROOT, sub));
    } catch (e) {
      cb(e);
    }
  },
  filename(_req, file, cb) {
    const ext = extOf(file);
    const base = sanitizeBaseName(file);
    const ts = Date.now();
    cb(null, `${ts}-${base}${ext}`);
  },
});

const uploadMedya = multer({
  storage,
  limits: { fileSize: MAX_VIDEO },
  fileFilter(req, file, cb) {
    const sub = resolveSubdir(req, file);
    if (!sub) {
      return cb(new Error("Desteklenmeyen uzantı veya tip uyumsuzluğu"));
    }
    cb(null, true);
  },
});

/** Tek alan adı: "dosya". FormData'da tip alanı dosyadan önce gönderilmeli. */
const uploadDosya = uploadMedya.single("dosya");

module.exports = {
  uploadMedya,
  uploadDosya,
  uploadMiddleware: uploadDosya,
  upload: uploadMedya,
  UPLOAD_ROOT,
  SUB,
  MAX_VIDEO,
  MAX_FOTO,
};
