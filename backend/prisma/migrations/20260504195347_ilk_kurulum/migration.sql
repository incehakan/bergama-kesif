-- CreateEnum
CREATE TYPE "Rol" AS ENUM ('ADMIN', 'EDITOR');

-- CreateEnum
CREATE TYPE "YKategori" AS ENUM ('RESTORAN', 'KAFE', 'PASTANE', 'SOKAK_LEZZETI', 'BAR');

-- CreateEnum
CREATE TYPE "Zorluk" AS ENUM ('KOLAY', 'ORTA', 'ZOR');

-- CreateEnum
CREATE TYPE "VRTip" AS ENUM ('FOTOGRAF_360', 'VIDEO_360');

-- CreateTable
CREATE TABLE "Belediye" (
    "id" SERIAL NOT NULL,
    "slug" TEXT NOT NULL,
    "ad" TEXT NOT NULL,
    "anaRenk" TEXT NOT NULL DEFAULT '#c0392b',
    "ikinciRenk" TEXT NOT NULL DEFAULT '#2c3e50',
    "logoUrl" TEXT,
    "aktif" BOOLEAN NOT NULL DEFAULT true,
    "olusturma" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Belediye_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Kullanici" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "sifre" TEXT NOT NULL,
    "ad" TEXT NOT NULL,
    "rol" "Rol" NOT NULL DEFAULT 'EDITOR',
    "aktif" BOOLEAN NOT NULL DEFAULT true,
    "belediyeId" INTEGER NOT NULL,
    "olusturma" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Kullanici_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tarihce" (
    "id" SERIAL NOT NULL,
    "baslik" TEXT NOT NULL,
    "icerik" TEXT NOT NULL,
    "kapakFotoUrl" TEXT,
    "galeriUrls" TEXT[],
    "yayinda" BOOLEAN NOT NULL DEFAULT true,
    "belediyeId" INTEGER NOT NULL,
    "guncelleme" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Tarihce_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BaskanMesaji" (
    "id" SERIAL NOT NULL,
    "baskanAdi" TEXT NOT NULL,
    "unvan" TEXT NOT NULL DEFAULT 'Belediye Başkanı',
    "mesaj" TEXT NOT NULL,
    "fotografUrl" TEXT,
    "belediyeId" INTEGER NOT NULL,
    "guncelleme" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BaskanMesaji_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "YemeIcme" (
    "id" SERIAL NOT NULL,
    "isim" TEXT NOT NULL,
    "kategori" "YKategori" NOT NULL,
    "aciklama" TEXT,
    "adres" TEXT,
    "telefon" TEXT,
    "kapakFotoUrl" TEXT,
    "galeriUrls" TEXT[],
    "koordinatLat" DOUBLE PRECISION,
    "koordinatLng" DOUBLE PRECISION,
    "yayinda" BOOLEAN NOT NULL DEFAULT true,
    "sira" INTEGER NOT NULL DEFAULT 0,
    "belediyeId" INTEGER NOT NULL,
    "olusturma" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "YemeIcme_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TurizmRotasi" (
    "id" SERIAL NOT NULL,
    "baslik" TEXT NOT NULL,
    "kisaAciklama" TEXT,
    "detayliAciklama" TEXT,
    "sureSaat" DOUBLE PRECISION,
    "mesafeKm" DOUBLE PRECISION,
    "zorluk" "Zorluk" NOT NULL DEFAULT 'KOLAY',
    "kapakFotoUrl" TEXT,
    "galeriUrls" TEXT[],
    "rotaDuraklar" JSONB NOT NULL,
    "yayinda" BOOLEAN NOT NULL DEFAULT true,
    "belediyeId" INTEGER NOT NULL,
    "olusturma" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TurizmRotasi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Etkinlik" (
    "id" SERIAL NOT NULL,
    "baslik" TEXT NOT NULL,
    "aciklama" TEXT,
    "tarihBaslangic" TIMESTAMP(3) NOT NULL,
    "tarihBitis" TIMESTAMP(3),
    "konum" TEXT,
    "kapakFotoUrl" TEXT,
    "ucretsiz" BOOLEAN NOT NULL DEFAULT true,
    "yayinda" BOOLEAN NOT NULL DEFAULT true,
    "belediyeId" INTEGER NOT NULL,
    "olusturma" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Etkinlik_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Haber" (
    "id" SERIAL NOT NULL,
    "baslik" TEXT NOT NULL,
    "ozet" TEXT,
    "icerik" TEXT,
    "kapakFotoUrl" TEXT,
    "yayinda" BOOLEAN NOT NULL DEFAULT true,
    "belediyeId" INTEGER NOT NULL,
    "olusturma" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Haber_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TarihiEser" (
    "id" SERIAL NOT NULL,
    "qrKodu" TEXT NOT NULL,
    "isim" TEXT NOT NULL,
    "donem" TEXT,
    "kisaAciklama" TEXT,
    "detayliAciklama" TEXT,
    "kapakFotoUrl" TEXT,
    "galeriUrls" TEXT[],
    "videoUrl" TEXT,
    "ekVideolar" TEXT[],
    "koordinatLat" DOUBLE PRECISION,
    "koordinatLng" DOUBLE PRECISION,
    "taramaSayisi" INTEGER NOT NULL DEFAULT 0,
    "yayinda" BOOLEAN NOT NULL DEFAULT true,
    "belediyeId" INTEGER NOT NULL,
    "vrIcerikId" INTEGER,
    "olusturma" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TarihiEser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VRIcerik" (
    "id" SERIAL NOT NULL,
    "baslik" TEXT NOT NULL,
    "aciklama" TEXT,
    "tip" "VRTip" NOT NULL,
    "dosyaUrl" TEXT NOT NULL,
    "onizlemeUrl" TEXT,
    "sure" INTEGER,
    "yayinda" BOOLEAN NOT NULL DEFAULT true,
    "belediyeId" INTEGER NOT NULL,
    "olusturma" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VRIcerik_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Belediye_slug_key" ON "Belediye"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Kullanici_email_belediyeId_key" ON "Kullanici"("email", "belediyeId");

-- CreateIndex
CREATE UNIQUE INDEX "TarihiEser_qrKodu_key" ON "TarihiEser"("qrKodu");

-- AddForeignKey
ALTER TABLE "Kullanici" ADD CONSTRAINT "Kullanici_belediyeId_fkey" FOREIGN KEY ("belediyeId") REFERENCES "Belediye"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tarihce" ADD CONSTRAINT "Tarihce_belediyeId_fkey" FOREIGN KEY ("belediyeId") REFERENCES "Belediye"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BaskanMesaji" ADD CONSTRAINT "BaskanMesaji_belediyeId_fkey" FOREIGN KEY ("belediyeId") REFERENCES "Belediye"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "YemeIcme" ADD CONSTRAINT "YemeIcme_belediyeId_fkey" FOREIGN KEY ("belediyeId") REFERENCES "Belediye"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TurizmRotasi" ADD CONSTRAINT "TurizmRotasi_belediyeId_fkey" FOREIGN KEY ("belediyeId") REFERENCES "Belediye"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Etkinlik" ADD CONSTRAINT "Etkinlik_belediyeId_fkey" FOREIGN KEY ("belediyeId") REFERENCES "Belediye"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Haber" ADD CONSTRAINT "Haber_belediyeId_fkey" FOREIGN KEY ("belediyeId") REFERENCES "Belediye"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TarihiEser" ADD CONSTRAINT "TarihiEser_belediyeId_fkey" FOREIGN KEY ("belediyeId") REFERENCES "Belediye"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TarihiEser" ADD CONSTRAINT "TarihiEser_vrIcerikId_fkey" FOREIGN KEY ("vrIcerikId") REFERENCES "VRIcerik"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VRIcerik" ADD CONSTRAINT "VRIcerik_belediyeId_fkey" FOREIGN KEY ("belediyeId") REFERENCES "Belediye"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
