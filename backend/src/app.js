require("dotenv").config();

const path = require("path");
const fs = require("fs");
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");

const { prisma } = require("./lib/prisma");
const { authMiddleware } = require("./middleware/auth.middleware");

const authRoutes = require("./routes/auth.routes");
const belediyeRoutes = require("./routes/belediye.routes");
const { publicRouter: tarihcePublic, adminRouter: tarihceAdmin } = require("./routes/tarihce.routes");
const { publicRouter: baskanPublic, adminRouter: baskanAdmin } = require("./routes/baskan.routes");
const { publicRouter: yemeicmePublic, adminRouter: yemeicmeAdmin } = require("./routes/yemeicme.routes");
const { publicRouter: rotalarPublic, adminRouter: rotalarAdmin } = require("./routes/rotalar.routes");
const { publicRouter: etkinliklerPublic, adminRouter: etkinliklerAdmin } = require("./routes/etkinlikler.routes");
const { publicRouter: haberlerPublic, adminRouter: haberlerAdmin } = require("./routes/haberler.routes");
const { publicRouter: eserlerPublic, adminRouter: eserlerAdmin } = require("./routes/eserler.routes");
const { publicRouter: vrPublic, adminRouter: vrAdmin } = require("./routes/vr.routes");
const medyaRoutes = require("./routes/medya.routes");

const uploadsDir = path.join(__dirname, "..", "uploads");
fs.mkdirSync(uploadsDir, { recursive: true });
["fotograflar", "videolar", "vr-360"].forEach((dir) => {
  fs.mkdirSync(path.join(uploadsDir, dir), { recursive: true });
});

const app = express();

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy: false,
  })
);
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:3000",
      "http://192.168.1.5:5173",
      "http://45.43.152.58:3002",
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use((req, res, next) => {
  const ct = (req.headers["content-type"] || "").toLowerCase();
  if (ct.includes("multipart/form-data")) return next();
  express.json({ limit: "10mb" })(req, res, next);
});
app.use((req, res, next) => {
  const ct = (req.headers["content-type"] || "").toLowerCase();
  if (ct.includes("multipart/form-data")) return next();
  express.urlencoded({ extended: true })(req, res, next);
});
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

async function loadPublicBelediye(req, res, next) {
  try {
    const slug = req.params.belediyeSlug;
    const belediye = await prisma.belediye.findFirst({
      where: { slug, aktif: true },
    });
    if (!belediye) {
      return res.status(404).json({ error: "Belediye bulunamadı veya pasif" });
    }
    req.belediyeId = belediye.id;
    req.belediye = belediye;
    next();
  } catch (err) {
    next(err);
  }
}

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.use("/api/auth", authRoutes);

app.use("/api/admin/medya", medyaRoutes);

const publicApi = express.Router({ mergeParams: true });
publicApi.use(loadPublicBelediye);
publicApi.use("/tarihce", tarihcePublic);
publicApi.use("/baskan", baskanPublic);
publicApi.use("/yemeicme", yemeicmePublic);
publicApi.use("/rotalar", rotalarPublic);
publicApi.use("/etkinlikler", etkinliklerPublic);
publicApi.use("/haberler", haberlerPublic);
publicApi.use("/eserler", eserlerPublic);
publicApi.use("/vr", vrPublic);

app.use("/api/public/:belediyeSlug", publicApi);

const adminApi = express.Router();
adminApi.use(authMiddleware);
adminApi.use("/belediye", belediyeRoutes);
adminApi.use("/tarihce", tarihceAdmin);
adminApi.use("/baskan", baskanAdmin);
adminApi.use("/yemeicme", yemeicmeAdmin);
adminApi.use("/rotalar", rotalarAdmin);
adminApi.use("/etkinlikler", etkinliklerAdmin);
adminApi.use("/haberler", haberlerAdmin);
adminApi.use("/eserler", eserlerAdmin);
adminApi.use("/vr", vrAdmin);

app.use("/api/admin", adminApi);

function safeErrSnapshot(err) {
  try {
    return {
      typeof: typeof err,
      asString: String(err),
      name: err && err.name,
      code: err && err.code,
      message: err instanceof Error ? err.message : err && err.message,
      stack: err instanceof Error ? String(err.stack).slice(0, 800) : undefined,
    };
  } catch {
    return { typeof: typeof err, asString: "[snapshot failed]" };
  }
}

app.use((err, _req, res, _next) => {
  try {
    fs.appendFileSync(
      path.join(__dirname, "..", "upload-error.log"),
      `${new Date().toISOString()} ${String(err)}\n`,
      "utf8"
    );
  } catch (_) {
    /* ignore */
  }
  const msg =
    err instanceof Error
      ? err.message
      : typeof err === "string"
        ? err
        : err != null && typeof err === "object" && "message" in err && typeof err.message === "string"
          ? err.message
          : String(err);
  const safeMsg = msg.trim() || "Sunucu hatası";
  console.error("HATA DETAYI:", safeMsg, "| raw:", String(err));
  console.error("STACK:", err instanceof Error ? err.stack : "(yok)");
  const isDev = (process.env.NODE_ENV || "development") !== "production";
  const attachInfo = isDev || safeMsg === "Sunucu hatası";
  res.status(500).json({
    error: safeMsg,
    ...(attachInfo ? { info: safeErrSnapshot(err) } : {}),
  });
});

const port = Number(process.env.PORT) || 3001;
app.listen(port, () => {
  console.log(`API http://localhost:${port} (pid=${process.pid})`);
});

module.exports = app;
