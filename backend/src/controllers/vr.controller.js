const { prisma } = require("../lib/prisma");

async function publicGetById(req, res) {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) return res.status(400).json({ error: "Geçersiz id" });

  const row = await prisma.vRIcerik.findFirst({
    where: { id, belediyeId: req.belediyeId, yayinda: true },
  });
  if (!row) return res.status(404).json({ error: "VR içerik bulunamadı" });
  return res.json(row);
}

async function adminList(req, res) {
  const rows = await prisma.vRIcerik.findMany({
    where: { belediyeId: req.user.belediyeId },
    orderBy: { id: "desc" },
  });
  return res.json(rows);
}

async function adminCreate(req, res) {
  const { baslik, aciklama, tip, dosyaUrl, onizlemeUrl, sure, yayinda } = req.body;
  if (!baslik || !tip || !dosyaUrl) {
    return res.status(400).json({ error: "baslik, tip ve dosyaUrl zorunludur" });
  }

  const row = await prisma.vRIcerik.create({
    data: {
      baslik,
      aciklama: aciklama ?? null,
      tip,
      dosyaUrl,
      onizlemeUrl: onizlemeUrl ?? null,
      sure: sure != null ? Number(sure) : null,
      yayinda: typeof yayinda === "boolean" ? yayinda : true,
      belediyeId: req.user.belediyeId,
    },
  });
  return res.status(201).json(row);
}

async function adminUpdate(req, res) {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) return res.status(400).json({ error: "Geçersiz id" });

  const existing = await prisma.vRIcerik.findFirst({
    where: { id, belediyeId: req.user.belediyeId },
  });
  if (!existing) return res.status(404).json({ error: "Kayıt bulunamadı" });

  const { baslik, aciklama, tip, dosyaUrl, onizlemeUrl, sure, yayinda } = req.body;

  const row = await prisma.vRIcerik.update({
    where: { id },
    data: {
      ...(baslik !== undefined && { baslik }),
      ...(aciklama !== undefined && { aciklama }),
      ...(tip !== undefined && { tip }),
      ...(dosyaUrl !== undefined && { dosyaUrl }),
      ...(onizlemeUrl !== undefined && { onizlemeUrl }),
      ...(sure !== undefined && { sure: sure == null ? null : Number(sure) }),
      ...(yayinda !== undefined && { yayinda }),
    },
  });
  return res.json(row);
}

async function adminDelete(req, res) {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) return res.status(400).json({ error: "Geçersiz id" });

  const existing = await prisma.vRIcerik.findFirst({
    where: { id, belediyeId: req.user.belediyeId },
  });
  if (!existing) return res.status(404).json({ error: "Kayıt bulunamadı" });

  await prisma.vRIcerik.delete({ where: { id } });
  return res.status(204).send();
}

module.exports = {
  publicGetById,
  adminList,
  adminCreate,
  adminUpdate,
  adminDelete,
};
