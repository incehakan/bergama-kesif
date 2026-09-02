-- CreateTable
CREATE TABLE "IletisimBilgisi" (
    "id" SERIAL NOT NULL,
    "telefon" TEXT,
    "eposta" TEXT,
    "adres" TEXT,
    "whatsapp" TEXT,
    "koordinatLat" DOUBLE PRECISION,
    "koordinatLng" DOUBLE PRECISION,
    "belediyeId" INTEGER NOT NULL,
    "guncelleme" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IletisimBilgisi_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "IletisimBilgisi" ADD CONSTRAINT "IletisimBilgisi_belediyeId_fkey" FOREIGN KEY ("belediyeId") REFERENCES "Belediye"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
