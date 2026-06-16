const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.warn("DATABASE_URL tanımlı değil; Prisma bağlantısı başarısız olabilir.");
}

const adapter = new PrismaPg({ connectionString: connectionString || "" });
const prisma = new PrismaClient({ adapter });

module.exports = { prisma };
