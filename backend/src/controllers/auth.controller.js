const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { prisma } = require("../lib/prisma");

function signToken(user) {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET tanımlı değil");
  return jwt.sign(
    { sub: user.id, belediyeId: user.belediyeId, rol: user.rol },
    secret,
    { expiresIn: "7d" }
  );
}

async function login(req, res) {
  try {
    const { email, sifre, belediyeSlug } = req.body;
    if (!email || !sifre) {
      return res.status(400).json({ error: "email ve sifre zorunludur" });
    }

    let kullanici;

    if (belediyeSlug) {
      const belediye = await prisma.belediye.findFirst({
        where: { slug: String(belediyeSlug), aktif: true },
      });
      if (!belediye) {
        return res.status(404).json({ error: "Belediye bulunamadı" });
      }
      kullanici = await prisma.kullanici.findFirst({
        where: { email: String(email).trim(), belediyeId: belediye.id, aktif: true },
        include: { belediye: true },
      });
    } else {
      const matches = await prisma.kullanici.findMany({
        where: { email: String(email).trim(), aktif: true },
        include: { belediye: true },
      });
      if (matches.length === 0) {
        return res.status(401).json({ error: "E-posta veya şifre hatalı" });
      }
      if (matches.length > 1) {
        return res.status(400).json({
          error: "Aynı e-posta birden fazla belediyede kayıtlı; belediyeSlug gönderin",
        });
      }
      kullanici = matches[0];
    }

    if (!kullanici) {
      return res.status(401).json({ error: "E-posta veya şifre hatalı" });
    }

    const ok = await bcrypt.compare(String(sifre), kullanici.sifre);
    if (!ok) {
      return res.status(401).json({ error: "E-posta veya şifre hatalı" });
    }

    const token = signToken(kullanici);
    const { sifre: _s, ...safe } = kullanici;
    return res.json({ token, user: safe });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Giriş işlenemedi" });
  }
}

async function me(req, res) {
  const { sifre: _s, ...safe } = await prisma.kullanici.findUnique({
    where: { id: req.user.id },
    include: { belediye: true },
  });
  return res.json(safe);
}

module.exports = { login, me };
