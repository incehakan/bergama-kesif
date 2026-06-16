const { prisma } = require("../lib/prisma");

function parseDate(value, field) {
  if (value === undefined || value === null) return undefined;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) throw new Error(`Geçersiz tarih: ${field}`);
  return d;
}

async function publicList(req, res) {
  const rows = await prisma.etkinlik.findMany({
    where: { belediyeId: req.belediyeId, yayinda: true },
    orderBy: { tarihBaslangic: "desc" },
  });
  return res.json(rows);
}

async function adminList(req, res) {
  const rows = await prisma.etkinlik.findMany({
    where: { belediyeId: req.user.belediyeId },
    orderBy: { tarihBaslangic: "desc" },
  });
  return res.json(rows);
}

async function adminCreate(req, res) {
  try {
    const {
      baslik,
      aciklama,
      tarihBaslangic,
      tarihBitis,
      konum,
      kapakFotoUrl,
      ucretsiz,
      yayinda,
    } = req.body;
    if (!baslik || !tarihBaslangic) {
      return res.status(400).json({ error: "baslik ve tarihBaslangic zorunludur" });
    }

    const row = await prisma.etkinlik.create({
      data: {
        baslik,
        aciklama: aciklama ?? null,
        tarihBaslangic: parseDate(tarihBaslangic, "tarihBaslangic"),
        tarihBitis: tarihBitis ? parseDate(tarihBitis, "tarihBitis") : null,
        konum: konum ?? null,
        kapakFotoUrl: kapakFotoUrl ?? null,
        ucretsiz: typeof ucretsiz === "boolean" ? ucretsiz : true,
        yayinda: typeof yayinda === "boolean" ? yayinda : true,
        belediyeId: req.user.belediyeId,
      },
    });
    return res.status(201).json(row);
  } catch (e) {
    if (e.message?.startsWith("Geçersiz tarih")) {
      return res.status(400).json({ error: e.message });
    }
    throw e;
  }
}

async function adminUpdate(req, res) {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) return res.status(400).json({ error: "Geçersiz id" });

  const existing = await prisma.etkinlik.findFirst({
    where: { id, belediyeId: req.user.belediyeId },
  });
  if (!existing) return res.status(404).json({ error: "Kayıt bulunamadı" });

  try {
    const {
      baslik,
      aciklama,
      tarihBaslangic,
      tarihBitis,
      konum,
      kapakFotoUrl,
      ucretsiz,
      yayinda,
    } = req.body;

    const row = await prisma.etkinlik.update({
      where: { id },
      data: {
        ...(baslik !== undefined && { baslik }),
        ...(aciklama !== undefined && { aciklama }),
        ...(tarihBaslangic !== undefined && {
          tarihBaslangic: parseDate(tarihBaslangic, "tarihBaslangic"),
        }),
        ...(tarihBitis !== undefined && {
          tarihBitis: tarihBitis ? parseDate(tarihBitis, "tarihBitis") : null,
        }),
        ...(konum !== undefined && { konum }),
        ...(kapakFotoUrl !== undefined && { kapakFotoUrl }),
        ...(ucretsiz !== undefined && { ucretsiz }),
        ...(yayinda !== undefined && { yayinda }),
      },
    });
    return res.json(row);
  } catch (e) {
    if (e.message?.startsWith("Geçersiz tarih")) {
      return res.status(400).json({ error: e.message });
    }
    throw e;
  }
}

async function adminDelete(req, res) {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) return res.status(400).json({ error: "Geçersiz id" });

  const existing = await prisma.etkinlik.findFirst({
    where: { id, belediyeId: req.user.belediyeId },
  });
  if (!existing) return res.status(404).json({ error: "Kayıt bulunamadı" });

  await prisma.etkinlik.delete({ where: { id } });
  return res.status(204).send();
}

module.exports = {
  publicList,
  adminList,
  adminCreate,
  adminUpdate,
  adminDelete,
};
