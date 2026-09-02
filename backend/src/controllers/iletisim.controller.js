const { prisma } = require("../lib/prisma");

function emptyToNull(v) {
  if (v == null) return null;
  if (typeof v === "string" && v.trim() === "") return null;
  return v;
}

function toFloatOrNull(v) {
  if (v == null || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

async function publicGet(req, res) {
  const row = await prisma.iletisimBilgisi.findFirst({
    where: { belediyeId: req.belediyeId },
    orderBy: { id: "desc" },
  });
  if (!row) return res.status(404).json({ error: "İletişim bilgisi bulunamadı" });
  return res.json(row);
}

async function adminGet(req, res) {
  const row = await prisma.iletisimBilgisi.findFirst({
    where: { belediyeId: req.user.belediyeId },
    orderBy: { id: "desc" },
  });
  return res.json(row);
}

async function adminPut(req, res) {
  const { telefon, eposta, adres, whatsapp, koordinatLat, koordinatLng } = req.body;

  const existing = await prisma.iletisimBilgisi.findFirst({
    where: { belediyeId: req.user.belediyeId },
    orderBy: { id: "desc" },
  });

  const data = {
    telefon: emptyToNull(telefon),
    eposta: emptyToNull(eposta),
    adres: emptyToNull(adres),
    whatsapp: emptyToNull(whatsapp),
    koordinatLat: toFloatOrNull(koordinatLat),
    koordinatLng: toFloatOrNull(koordinatLng),
  };

  const row = existing
    ? await prisma.iletisimBilgisi.update({
        where: { id: existing.id },
        data,
      })
    : await prisma.iletisimBilgisi.create({
        data: { ...data, belediyeId: req.user.belediyeId },
      });

  return res.json(row);
}

module.exports = { publicGet, adminGet, adminPut };
