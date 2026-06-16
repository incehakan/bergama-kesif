const { prisma } = require("../lib/prisma");

async function publicList(req, res) {
  const rows = await prisma.tarihiEser.findMany({
    where: { belediyeId: req.belediyeId, yayinda: true },
    orderBy: { olusturma: "desc" },
    include: { vrIcerik: true },
  });
  return res.json(rows);
}

async function publicGetByQr(req, res) {
  const qrKodu = req.params.qrKodu;
  if (!qrKodu) return res.status(400).json({ error: "qrKodu gerekli" });

  const row = await prisma.tarihiEser.findFirst({
    where: {
      qrKodu,
      belediyeId: req.belediyeId,
      yayinda: true,
    },
    include: { vrIcerik: true },
  });
  if (!row) return res.status(404).json({ error: "Eser bulunamadı" });

  await prisma.tarihiEser.update({
    where: { id: row.id },
    data: { taramaSayisi: { increment: 1 } },
  });

  const updated = await prisma.tarihiEser.findUnique({
    where: { id: row.id },
    include: { vrIcerik: true },
  });
  return res.json(updated);
}

async function adminList(req, res) {
  const rows = await prisma.tarihiEser.findMany({
    where: { belediyeId: req.user.belediyeId },
    orderBy: { id: "desc" },
    include: { vrIcerik: true },
  });
  return res.json(rows);
}

async function adminCreate(req, res) {
  const {
    isim,
    donem,
    kisaAciklama,
    detayliAciklama,
    kapakFotoUrl,
    galeriUrls,
    videoUrl,
    ekVideolar,
    koordinatLat,
    koordinatLng,
    yayinda,
    vrIcerikId,
  } = req.body;
  if (!isim) {
    return res.status(400).json({ error: "isim zorunludur" });
  }

  if (vrIcerikId != null) {
    const vr = await prisma.vRIcerik.findFirst({
      where: { id: Number(vrIcerikId), belediyeId: req.user.belediyeId },
    });
    if (!vr) return res.status(400).json({ error: "vrIcerikId bu belediyeye ait değil" });
  }

  const row = await prisma.tarihiEser.create({
    data: {
      isim,
      donem: donem ?? null,
      kisaAciklama: kisaAciklama ?? null,
      detayliAciklama: detayliAciklama ?? null,
      kapakFotoUrl: kapakFotoUrl ?? null,
      galeriUrls: Array.isArray(galeriUrls) ? galeriUrls : [],
      videoUrl: videoUrl ?? null,
      ekVideolar: Array.isArray(ekVideolar) ? ekVideolar : [],
      koordinatLat: koordinatLat ?? null,
      koordinatLng: koordinatLng ?? null,
      yayinda: typeof yayinda === "boolean" ? yayinda : true,
      belediyeId: req.user.belediyeId,
      vrIcerikId: vrIcerikId != null ? Number(vrIcerikId) : null,
    },
    include: { vrIcerik: true },
  });
  return res.status(201).json(row);
}

async function adminUpdate(req, res) {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) return res.status(400).json({ error: "Geçersiz id" });

  const existing = await prisma.tarihiEser.findFirst({
    where: { id, belediyeId: req.user.belediyeId },
  });
  if (!existing) return res.status(404).json({ error: "Kayıt bulunamadı" });

  const {
    isim,
    donem,
    kisaAciklama,
    detayliAciklama,
    kapakFotoUrl,
    galeriUrls,
    videoUrl,
    ekVideolar,
    koordinatLat,
    koordinatLng,
    yayinda,
    vrIcerikId,
  } = req.body;

  if (vrIcerikId !== undefined && vrIcerikId != null) {
    const vr = await prisma.vRIcerik.findFirst({
      where: { id: Number(vrIcerikId), belediyeId: req.user.belediyeId },
    });
    if (!vr) return res.status(400).json({ error: "vrIcerikId bu belediyeye ait değil" });
  }

  const row = await prisma.tarihiEser.update({
    where: { id },
    data: {
      ...(isim !== undefined && { isim }),
      ...(donem !== undefined && { donem }),
      ...(kisaAciklama !== undefined && { kisaAciklama }),
      ...(detayliAciklama !== undefined && { detayliAciklama }),
      ...(kapakFotoUrl !== undefined && { kapakFotoUrl }),
      ...(galeriUrls !== undefined && { galeriUrls: Array.isArray(galeriUrls) ? galeriUrls : [] }),
      ...(videoUrl !== undefined && { videoUrl }),
      ...(ekVideolar !== undefined && { ekVideolar: Array.isArray(ekVideolar) ? ekVideolar : [] }),
      ...(koordinatLat !== undefined && { koordinatLat }),
      ...(koordinatLng !== undefined && { koordinatLng }),
      ...(yayinda !== undefined && { yayinda }),
      ...(vrIcerikId !== undefined && {
        vrIcerikId: vrIcerikId == null ? null : Number(vrIcerikId),
      }),
    },
    include: { vrIcerik: true },
  });
  return res.json(row);
}

async function adminDelete(req, res) {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) return res.status(400).json({ error: "Geçersiz id" });

  const existing = await prisma.tarihiEser.findFirst({
    where: { id, belediyeId: req.user.belediyeId },
  });
  if (!existing) return res.status(404).json({ error: "Kayıt bulunamadı" });

  await prisma.tarihiEser.delete({ where: { id } });
  return res.status(204).send();
}

module.exports = {
  publicList,
  publicGetByQr,
  adminList,
  adminCreate,
  adminUpdate,
  adminDelete,
};
