const { prisma } = require("../lib/prisma");

async function publicList(req, res) {
  const [eserler, mekanlar] = await Promise.all([
    prisma.tarihiEser.findMany({
      where: {
        belediyeId: req.belediyeId,
        yayinda: true,
        koordinatLat: { not: null },
        koordinatLng: { not: null },
      },
    }),
    prisma.yemeIcme.findMany({
      where: {
        belediyeId: req.belediyeId,
        yayinda: true,
        koordinatLat: { not: null },
        koordinatLng: { not: null },
      },
    }),
  ]);
  const noktalar = [
    ...eserler.map((e) => ({
      tip: "eser",
      id: e.id,
      isim: e.isim,
      koordinatLat: e.koordinatLat,
      koordinatLng: e.koordinatLng,
      kapakFotoUrl: e.kapakFotoUrl,
      kisaAciklama: e.kisaAciklama,
      donem: e.donem,
    })),
    ...mekanlar.map((m) => ({
      tip: "yemeicme",
      id: m.id,
      isim: m.isim,
      koordinatLat: m.koordinatLat,
      koordinatLng: m.koordinatLng,
      kapakFotoUrl: m.kapakFotoUrl,
      kategori: m.kategori,
      adres: m.adres,
      telefon: m.telefon,
    })),
  ];
  return res.json(noktalar);
}

module.exports = { publicList };
