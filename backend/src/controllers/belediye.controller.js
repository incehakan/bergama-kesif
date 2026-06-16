const { prisma } = require("../lib/prisma");

async function getMyBelediye(req, res) {
  const b = await prisma.belediye.findUnique({
    where: { id: req.user.belediyeId },
  });
  if (!b) return res.status(404).json({ error: "Belediye bulunamadı" });
  return res.json(b);
}

module.exports = { getMyBelediye };
