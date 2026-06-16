const jwt = require("jsonwebtoken");
const { prisma } = require("../lib/prisma");

async function authMiddleware(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Yetkisiz: token gerekli" });
  }

  const token = header.slice(7);
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    return res.status(500).json({ error: "Sunucu yapılandırması eksik (JWT_SECRET)" });
  }

  try {
    const payload = jwt.verify(token, secret);
    const userId = payload.sub ?? payload.userId;
    if (!userId) {
      return res.status(401).json({ error: "Geçersiz token" });
    }

    const user = await prisma.kullanici.findFirst({
      where: { id: userId, aktif: true },
      include: { belediye: true },
    });

    if (!user) {
      return res.status(401).json({ error: "Kullanıcı bulunamadı veya pasif" });
    }

    req.user = {
      id: user.id,
      email: user.email,
      ad: user.ad,
      rol: user.rol,
      belediyeId: user.belediyeId,
      belediye: user.belediye,
    };
    next();
  } catch {
    return res.status(401).json({ error: "Geçersiz veya süresi dolmuş token" });
  }
}

module.exports = { authMiddleware };
