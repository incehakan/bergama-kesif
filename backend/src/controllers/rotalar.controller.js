const { prisma } = require("../lib/prisma");

async function publicList(req, res) {
  const rows = await prisma.turizmRotasi.findMany({
    where: { belediyeId: req.belediyeId, yayinda: true },
    orderBy: { id: "desc" },
  });
  return res.json(rows);
}

async function adminList(req, res) {
  const rows = await prisma.turizmRotasi.findMany({
    where: { belediyeId: req.user.belediyeId },
    orderBy: { id: "desc" },
  });
  return res.json(rows);
}

async function adminCreate(req, res) {
  const {
    baslik,
    kisaAciklama,
    detayliAciklama,
    sureSaat,
    mesafeKm,
    zorluk,
    kapakFotoUrl,
    galeriUrls,
    rotaDuraklar,
    yayinda,
  } = req.body;
  if (!baslik || rotaDuraklar === undefined) {
    return res.status(400).json({ error: "baslik ve rotaDuraklar zorunludur" });
  }

  const row = await prisma.turizmRotasi.create({
    data: {
      baslik,
      kisaAciklama: kisaAciklama ?? null,
      detayliAciklama: detayliAciklama ?? null,
      sureSaat: sureSaat ?? null,
      mesafeKm: mesafeKm ?? null,
      zorluk: zorluk ?? "KOLAY",
      kapakFotoUrl: kapakFotoUrl ?? null,
      galeriUrls: Array.isArray(galeriUrls) ? galeriUrls : [],
      rotaDuraklar,
      yayinda: typeof yayinda === "boolean" ? yayinda : true,
      belediyeId: req.user.belediyeId,
    },
  });
  return res.status(201).json(row);
}

async function adminUpdate(req, res) {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) return res.status(400).json({ error: "Geçersiz id" });

  const existing = await prisma.turizmRotasi.findFirst({
    where: { id, belediyeId: req.user.belediyeId },
  });
  if (!existing) return res.status(404).json({ error: "Kayıt bulunamadı" });

  const {
    baslik,
    kisaAciklama,
    detayliAciklama,
    sureSaat,
    mesafeKm,
    zorluk,
    kapakFotoUrl,
    galeriUrls,
    rotaDuraklar,
    yayinda,
  } = req.body;

  const row = await prisma.turizmRotasi.update({
    where: { id },
    data: {
      ...(baslik !== undefined && { baslik }),
      ...(kisaAciklama !== undefined && { kisaAciklama }),
      ...(detayliAciklama !== undefined && { detayliAciklama }),
      ...(sureSaat !== undefined && { sureSaat }),
      ...(mesafeKm !== undefined && { mesafeKm }),
      ...(zorluk !== undefined && { zorluk }),
      ...(kapakFotoUrl !== undefined && { kapakFotoUrl }),
      ...(galeriUrls !== undefined && { galeriUrls: Array.isArray(galeriUrls) ? galeriUrls : [] }),
      ...(rotaDuraklar !== undefined && { rotaDuraklar }),
      ...(yayinda !== undefined && { yayinda }),
    },
  });
  return res.json(row);
}

async function adminDelete(req, res) {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) return res.status(400).json({ error: "Geçersiz id" });

  const existing = await prisma.turizmRotasi.findFirst({
    where: { id, belediyeId: req.user.belediyeId },
  });
  if (!existing) return res.status(404).json({ error: "Kayıt bulunamadı" });

  await prisma.turizmRotasi.delete({ where: { id } });
  return res.status(204).send();
}

module.exports = {
  publicList,
  adminList,
  adminCreate,
  adminUpdate,
  adminDelete,
};
