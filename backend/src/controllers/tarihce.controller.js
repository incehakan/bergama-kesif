const { prisma } = require("../lib/prisma");

async function publicGet(req, res) {
  const row = await prisma.tarihce.findFirst({
    where: { belediyeId: req.belediyeId, yayinda: true },
    orderBy: { id: "desc" },
  });
  if (!row) return res.status(404).json({ error: "Tarihçe bulunamadı" });
  return res.json(row);
}

async function adminGet(req, res) {
  const row = await prisma.tarihce.findFirst({
    where: { belediyeId: req.user.belediyeId },
    orderBy: { id: "desc" },
  });
  return res.json(row);
}

async function adminPut(req, res) {
  const { baslik, icerik, kapakFotoUrl, galeriUrls, yayinda } = req.body;
  if (!baslik || !icerik) {
    return res.status(400).json({ error: "baslik ve icerik zorunludur" });
  }

  const existing = await prisma.tarihce.findFirst({
    where: { belediyeId: req.user.belediyeId },
    orderBy: { id: "desc" },
  });

  const data = {
    baslik,
    icerik,
    kapakFotoUrl: kapakFotoUrl ?? null,
    galeriUrls: Array.isArray(galeriUrls) ? galeriUrls : [],
    yayinda: typeof yayinda === "boolean" ? yayinda : true,
  };

  const row = existing
    ? await prisma.tarihce.update({
        where: { id: existing.id },
        data,
      })
    : await prisma.tarihce.create({
        data: { ...data, belediyeId: req.user.belediyeId },
      });

  return res.json(row);
}

module.exports = { publicGet, adminGet, adminPut };
