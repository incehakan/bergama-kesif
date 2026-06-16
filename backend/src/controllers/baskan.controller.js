const { prisma } = require("../lib/prisma");

async function publicGet(req, res) {
  const row = await prisma.baskanMesaji.findFirst({
    where: { belediyeId: req.belediyeId },
    orderBy: { id: "desc" },
  });
  if (!row) return res.status(404).json({ error: "Başkan mesajı bulunamadı" });
  return res.json(row);
}

async function adminGet(req, res) {
  const row = await prisma.baskanMesaji.findFirst({
    where: { belediyeId: req.user.belediyeId },
    orderBy: { id: "desc" },
  });
  return res.json(row);
}

async function adminPut(req, res) {
  const { baskanAdi, unvan, mesaj, fotografUrl } = req.body;
  if (!baskanAdi || !mesaj) {
    return res.status(400).json({ error: "baskanAdi ve mesaj zorunludur" });
  }

  const existing = await prisma.baskanMesaji.findFirst({
    where: { belediyeId: req.user.belediyeId },
    orderBy: { id: "desc" },
  });

  const data = {
    baskanAdi,
    mesaj,
    unvan: unvan ?? "Belediye Başkanı",
    fotografUrl: fotografUrl ?? null,
  };

  const row = existing
    ? await prisma.baskanMesaji.update({
        where: { id: existing.id },
        data,
      })
    : await prisma.baskanMesaji.create({
        data: { ...data, belediyeId: req.user.belediyeId },
      });

  return res.json(row);
}

module.exports = { publicGet, adminGet, adminPut };
