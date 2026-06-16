const { prisma } = require("../lib/prisma");

async function publicList(req, res) {
  const rows = await prisma.haber.findMany({
    where: { belediyeId: req.belediyeId, yayinda: true },
    orderBy: { olusturma: "desc" },
  });
  return res.json(rows);
}

async function publicGetById(req, res) {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) return res.status(400).json({ error: "Geçersiz id" });

  const row = await prisma.haber.findFirst({
    where: { id, belediyeId: req.belediyeId, yayinda: true },
  });
  if (!row) return res.status(404).json({ error: "Haber bulunamadı" });
  return res.json(row);
}

async function adminList(req, res) {
  const rows = await prisma.haber.findMany({
    where: { belediyeId: req.user.belediyeId },
    orderBy: { olusturma: "desc" },
  });
  return res.json(rows);
}

async function adminCreate(req, res) {
  const { baslik, ozet, icerik, kapakFotoUrl, yayinda } = req.body;
  if (!baslik) {
    return res.status(400).json({ error: "baslik zorunludur" });
  }

  const row = await prisma.haber.create({
    data: {
      baslik,
      ozet: ozet ?? null,
      icerik: icerik ?? null,
      kapakFotoUrl: kapakFotoUrl ?? null,
      yayinda: typeof yayinda === "boolean" ? yayinda : true,
      belediyeId: req.user.belediyeId,
    },
  });
  return res.status(201).json(row);
}

async function adminUpdate(req, res) {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) return res.status(400).json({ error: "Geçersiz id" });

  const existing = await prisma.haber.findFirst({
    where: { id, belediyeId: req.user.belediyeId },
  });
  if (!existing) return res.status(404).json({ error: "Kayıt bulunamadı" });

  const { baslik, ozet, icerik, kapakFotoUrl, yayinda } = req.body;

  const row = await prisma.haber.update({
    where: { id },
    data: {
      ...(baslik !== undefined && { baslik }),
      ...(ozet !== undefined && { ozet }),
      ...(icerik !== undefined && { icerik }),
      ...(kapakFotoUrl !== undefined && { kapakFotoUrl }),
      ...(yayinda !== undefined && { yayinda }),
    },
  });
  return res.json(row);
}

async function adminDelete(req, res) {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) return res.status(400).json({ error: "Geçersiz id" });

  const existing = await prisma.haber.findFirst({
    where: { id, belediyeId: req.user.belediyeId },
  });
  if (!existing) return res.status(404).json({ error: "Kayıt bulunamadı" });

  await prisma.haber.delete({ where: { id } });
  return res.status(204).send();
}

module.exports = {
  publicList,
  publicGetById,
  adminList,
  adminCreate,
  adminUpdate,
  adminDelete,
};
