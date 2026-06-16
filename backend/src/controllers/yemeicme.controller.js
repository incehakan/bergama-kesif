const { prisma } = require("../lib/prisma");

async function publicList(req, res) {
  const { kategori } = req.query;
  const where = {
    belediyeId: req.belediyeId,
    yayinda: true,
  };
  if (kategori) {
    where.kategori = String(kategori);
  }

  const rows = await prisma.yemeIcme.findMany({
    where,
    orderBy: [{ sira: "asc" }, { id: "asc" }],
  });
  return res.json(rows);
}

async function adminList(req, res) {
  const rows = await prisma.yemeIcme.findMany({
    where: { belediyeId: req.user.belediyeId },
    orderBy: [{ sira: "asc" }, { id: "asc" }],
  });
  return res.json(rows);
}

async function adminCreate(req, res) {
  const {
    isim,
    kategori,
    aciklama,
    adres,
    telefon,
    kapakFotoUrl,
    galeriUrls,
    koordinatLat,
    koordinatLng,
    yayinda,
    sira,
  } = req.body;
  if (!isim || !kategori) {
    return res.status(400).json({ error: "isim ve kategori zorunludur" });
  }

  const row = await prisma.yemeIcme.create({
    data: {
      isim,
      kategori,
      aciklama: aciklama ?? null,
      adres: adres ?? null,
      telefon: telefon ?? null,
      kapakFotoUrl: kapakFotoUrl ?? null,
      galeriUrls: Array.isArray(galeriUrls) ? galeriUrls : [],
      koordinatLat: koordinatLat ?? null,
      koordinatLng: koordinatLng ?? null,
      yayinda: typeof yayinda === "boolean" ? yayinda : true,
      sira: typeof sira === "number" ? sira : 0,
      belediyeId: req.user.belediyeId,
    },
  });
  return res.status(201).json(row);
}

async function adminUpdate(req, res) {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) return res.status(400).json({ error: "Geçersiz id" });

  const existing = await prisma.yemeIcme.findFirst({
    where: { id, belediyeId: req.user.belediyeId },
  });
  if (!existing) return res.status(404).json({ error: "Kayıt bulunamadı" });

  const {
    isim,
    kategori,
    aciklama,
    adres,
    telefon,
    kapakFotoUrl,
    galeriUrls,
    koordinatLat,
    koordinatLng,
    yayinda,
    sira,
  } = req.body;

  const row = await prisma.yemeIcme.update({
    where: { id },
    data: {
      ...(isim !== undefined && { isim }),
      ...(kategori !== undefined && { kategori }),
      ...(aciklama !== undefined && { aciklama }),
      ...(adres !== undefined && { adres }),
      ...(telefon !== undefined && { telefon }),
      ...(kapakFotoUrl !== undefined && { kapakFotoUrl }),
      ...(galeriUrls !== undefined && { galeriUrls: Array.isArray(galeriUrls) ? galeriUrls : [] }),
      ...(koordinatLat !== undefined && { koordinatLat }),
      ...(koordinatLng !== undefined && { koordinatLng }),
      ...(yayinda !== undefined && { yayinda }),
      ...(sira !== undefined && { sira }),
    },
  });
  return res.json(row);
}

async function adminDelete(req, res) {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) return res.status(400).json({ error: "Geçersiz id" });

  const existing = await prisma.yemeIcme.findFirst({
    where: { id, belediyeId: req.user.belediyeId },
  });
  if (!existing) return res.status(404).json({ error: "Kayıt bulunamadı" });

  await prisma.yemeIcme.delete({ where: { id } });
  return res.status(204).send();
}

module.exports = {
  publicList,
  adminList,
  adminCreate,
  adminUpdate,
  adminDelete,
};
