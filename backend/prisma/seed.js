require("dotenv").config();

const bcrypt = require("bcryptjs");
const { prisma } = require("../src/lib/prisma");

const ADMIN_EMAIL = "admin@bergama.bel.tr";
const ADMIN_PASSWORD = "Bergama2024!";

const YEME_ICME_SEED = [
  {
    isim: "Bergama Sofrası",
    kategori: "RESTORAN",
    aciklama: "Ege mutfağının en güzel örnekleri",
    adres: "Cumhuriyet Meydanı No:5",
    telefon: "0232 631 0001",
    yayinda: true,
  },
  {
    isim: "Akropol Restoran",
    kategori: "RESTORAN",
    aciklama: "Antik tiyatro manzaralı restoranımızda tarihi lezzetler",
    adres: "Akropol Yolu No:12",
    telefon: "0232 631 0002",
    yayinda: true,
  },
  {
    isim: "Bergama Kahvesi",
    kategori: "KAFE",
    aciklama: "Türk kahvesi ve Ege böreği",
    adres: "Çarşı Sokak No:3",
    telefon: "0232 631 0003",
    yayinda: true,
  },
  {
    isim: "Antik Pastane",
    kategori: "PASTANE",
    aciklama: "El yapımı Bergama tatlıları",
    adres: "İstiklal Caddesi No:8",
    telefon: "0232 631 0004",
    yayinda: true,
  },
  {
    isim: "Çarşı Döner",
    kategori: "SOKAK_LEZZETI",
    aciklama: "50 yıllık geleneksel döner ustası",
    adres: "Kapalı Çarşı",
    telefon: "0232 631 0005",
    yayinda: true,
  },
];

const ROTALAR_SEED = [
  {
    baslik: "Akropol Yürüyüş Rotası",
    kisaAciklama: "Bergama Akropolü'nü keşfet",
    detayliAciklama:
      "Antik Bergama'nın zirvesine çıkan bu rota sizi Helenistik dönemin görkemli yapılarıyla buluşturuyor.",
    sureSaat: 2.5,
    mesafeKm: 4.2,
    zorluk: "ORTA",
    yayinda: true,
    rotaDuraklar: [],
  },
  {
    baslik: "Asklepion Sağlık Tapınağı Turu",
    kisaAciklama: "Antik dünyanın şifa merkezi",
    detayliAciklama:
      "MÖ 4. yüzyılda kurulan Asklepion, antik dünyanın en ünlü sağlık merkezlerinden biriydi.",
    sureSaat: 1.5,
    mesafeKm: 2.8,
    zorluk: "KOLAY",
    yayinda: true,
    rotaDuraklar: [],
  },
  {
    baslik: "Kızıl Avlu Tarihi Tur",
    kisaAciklama: "Roma döneminin görkemli yapısı",
    detayliAciklama:
      "Romalılar döneminde inşa edilen Kızıl Avlu, Bergama'nın en etkileyici antik yapılarından biridir.",
    sureSaat: 1.0,
    mesafeKm: 1.5,
    zorluk: "KOLAY",
    yayinda: true,
    rotaDuraklar: [],
  },
  {
    baslik: "Bergama Müzesi Kültür Rotası",
    kisaAciklama: "Tarihin izinde şehir turu",
    detayliAciklama:
      "Bergama Arkeoloji Müzesi'nden başlayıp çarşıya uzanan bu rota şehrin tarihini gözler önüne seriyor.",
    sureSaat: 3.0,
    mesafeKm: 5.0,
    zorluk: "KOLAY",
    yayinda: true,
    rotaDuraklar: [],
  },
  {
    baslik: "Doğa ve Tarih Yürüyüşü",
    kisaAciklama: "Selinus Vadisi'nde doğa yürüyüşü",
    detayliAciklama:
      "Bergama'nın yeşil vadilerinde tarihi kalıntıları keşfederek yapılan bu yürüyüş hem doğa hem tarih tutkunlarına hitap ediyor.",
    sureSaat: 4.0,
    mesafeKm: 8.5,
    zorluk: "ZOR",
    yayinda: true,
    rotaDuraklar: [],
  },
];

const ETKINLIK_SEED = [
  {
    baslik: "Bergama Uluslararası Antik Tiyatro Festivali",
    aciklama: "Antik tiyatroda dünya standartlarında performanslar",
    tarihBaslangic: new Date("2026-06-15T18:00:00Z"),
    tarihBitis: new Date("2026-06-20T23:00:00Z"),
    konum: "Bergama Antik Tiyatrosu",
    ucretsiz: false,
    yayinda: true,
  },
  {
    baslik: "Yöresel Lezzetler Festivali",
    aciklama: "Bergama'nın geleneksel tatları bir arada",
    tarihBaslangic: new Date("2026-07-10T10:00:00Z"),
    tarihBitis: new Date("2026-07-12T20:00:00Z"),
    konum: "Cumhuriyet Meydanı",
    ucretsiz: true,
    yayinda: true,
  },
  {
    baslik: "Antik Kent Fotoğraf Yarışması",
    aciklama: "Bergama'yı fotoğrafla ölümsüzleştir",
    tarihBaslangic: new Date("2026-05-20T09:00:00Z"),
    tarihBitis: new Date("2026-05-25T18:00:00Z"),
    konum: "Bergama Akropolü",
    ucretsiz: true,
    yayinda: true,
  },
  {
    baslik: "Çocuk Arkeolog Kampı",
    aciklama: "8-14 yaş arası çocuklar için arkeoloji eğitimi",
    tarihBaslangic: new Date("2026-07-01T09:00:00Z"),
    tarihBitis: new Date("2026-07-05T17:00:00Z"),
    konum: "Bergama Müzesi",
    ucretsiz: false,
    yayinda: true,
  },
  {
    baslik: "Bergama Zeytinyağı Günleri",
    aciklama: "Yörenin ünlü zeytinyağı ürünleri tanıtım festivali",
    tarihBaslangic: new Date("2026-09-05T10:00:00Z"),
    tarihBitis: new Date("2026-09-07T19:00:00Z"),
    konum: "Bergama Kapalı Çarşısı",
    ucretsiz: true,
    yayinda: true,
  },
];

const HABER_SEED = [
  {
    baslik: "Bergama Akropolü UNESCO Listesinde",
    ozet: "Bergama Çok Katmanlı Kültürel Peyzaj alanı UNESCO Dünya Mirası listesine girdi",
    icerik:
      "Bergama antik kenti, sahip olduğu eşsiz tarihi ve kültürel değerleriyle UNESCO Dünya Mirası listesine alındı. Bu önemli başarı Bergama'yı dünya haritasına taşıdı.",
    yayinda: true,
  },
  {
    baslik: "Yeni Arkeolojik Keşif: Roma Dönemi Villası",
    ozet: "Bergama'da yapılan kazılarda Roma dönemine ait büyük bir villa kalıntısı bulundu",
    icerik:
      "Bergama Arkeoloji Müzesi uzmanları tarafından yürütülen kazı çalışmalarında MÖ 2. yüzyıla tarihlenen bir Roma villası gün yüzüne çıkarıldı.",
    yayinda: true,
  },
  {
    baslik: "Bergama-Berlin Kardeş Şehir Anlaşması",
    ozet: "Bergama ve Berlin arasında kültürel işbirliği protokolü imzalandı",
    icerik:
      "Bergama Belediyesi ile Almanya'nın başkenti Berlin arasında imzalanan kardeş şehir anlaşması, iki şehir arasındaki kültürel bağları güçlendirecek.",
    yayinda: true,
  },
  {
    baslik: "Akropol Teleferik Hattı Açılıyor",
    ozet: "Bergama Akropolü'ne ulaşımı kolaylaştıracak teleferik hattı hizmete giriyor",
    icerik:
      "Bergama Belediyesi'nin hayata geçirdiği teleferik projesi tamamlandı. Ziyaretçiler artık Akropol'e kolayca ulaşabilecek.",
    yayinda: true,
  },
  {
    baslik: "Bergama Müzesi Yenilendi",
    ozet: "Bergama Arkeoloji Müzesi modern sergileme teknolojileriyle yenilendi",
    icerik:
      "Kapsamlı restorasyon çalışmalarının ardından yeniden açılan Bergama Arkeoloji Müzesi, modern sergileme teknolojileriyle ziyaretçilerini karşılıyor.",
    yayinda: true,
  },
];

const ESER_SEED = [
  {
    isim: "Zeus Sunağı",
    donem: "Helenistik Dönem (MÖ 197-159)",
    kisaAciklama: "Antik dünyanın 7 harikasından biri olarak kabul edilen görkemli sunak",
    detayliAciklama:
      "Bergama Akropolü'nde yer alan Zeus Sunağı, MÖ 2. yüzyılda II. Eumenes döneminde inşa edilmiştir. Sunağın frizleri Titanlarla Olimpos tanrıları arasındaki savaşı tasvir etmektedir. Orijinal kalıntılar bugün Berlin'deki Pergamon Müzesi'nde sergilenmektedir.",
    koordinatLat: 39.1285,
    koordinatLng: 27.184,
    yayinda: true,
  },
  {
    isim: "Trajan Tapınağı",
    donem: "Roma Dönemi (MS 2. yy)",
    kisaAciklama: "Akropolün zirvesinde Roma imparatoruna adanmış tapınak",
    detayliAciklama:
      "İmparator Trajan ve Hadrian onuruna inşa edilen bu tapınak, Bergama Akropolü'nün en yüksek noktasında yer almaktadır. Korint düzenindeki sütunları ve muhteşem manzarasıyla ziyaretçileri büyülemektedir.",
    koordinatLat: 39.1292,
    koordinatLng: 27.1836,
    yayinda: true,
  },
  {
    isim: "Kızıl Avlu (Serapeion)",
    donem: "Roma Dönemi (MS 2. yy)",
    kisaAciklama: "Mısır tanrısı Serapis'e adanmış anıtsal tapınak kompleksi",
    detayliAciklama:
      "Kızıl tuğlalardan inşa edilen bu devasa yapı, Roma döneminde Mısır tanrısı Serapis'e adanmıştır. Sonraki dönemde Hristiyan kilisesine dönüştürülmüştür. Yapının altından Selinus Çayı geçirilmiş olması dönemin mühendislik anlayışını gözler önüne sermektedir.",
    koordinatLat: 39.1198,
    koordinatLng: 27.1842,
    yayinda: true,
  },
  {
    isim: "Asklepion",
    donem: "Helenistik-Roma Dönemi (MÖ 4. yy - MS 3. yy)",
    kisaAciklama: "Antik dünyanın ünlü sağlık ve şifa merkezi",
    detayliAciklama:
      "Sağlık tanrısı Asklepios'a adanan bu kutsal alan, antik dünyanın en önemli tıp merkezlerinden biriydi. Ünlü hekim Galen burada yetişmiştir. Hastalar burada müzik, su sesi ve rüya yorumuyla tedavi edilirdi.",
    koordinatLat: 39.1178,
    koordinatLng: 27.1698,
    yayinda: true,
  },
  {
    isim: "Bergama Antik Tiyatrosu",
    donem: "Helenistik Dönem (MÖ 3. yy)",
    kisaAciklama: "Dünyanın en dik antik tiyatrolarından biri",
    detayliAciklama:
      "10.000 kişilik kapasitesiyle antik dünyanın en büyük tiyatrolarından biri olan Bergama Antik Tiyatrosu, 78 derecelik eğimiyle dünyanın en dik tiyatrolarından biridir. Akropol yamacına oyulmuş bu tiyatroda bugün hâlâ etkinlikler düzenlenmektedir.",
    koordinatLat: 39.1275,
    koordinatLng: 27.1825,
    yayinda: true,
  },
];

async function seedBergamaDemoContent() {
  const bergama = await prisma.belediye.findFirst({
    where: { slug: "bergama" },
  });
  if (!bergama) {
    throw new Error("Bergama belediyesi bulunamadı. Önce belediye ve admin seed çalışmalı.");
  }
  const belediyeId = bergama.id;

  for (const row of YEME_ICME_SEED) {
    const existing = await prisma.yemeIcme.findFirst({
      where: { belediyeId, isim: row.isim },
    });
    if (existing) continue;
    await prisma.yemeIcme.create({
      data: {
        ...row,
        belediyeId,
        galeriUrls: [],
        kapakFotoUrl: null,
        koordinatLat: null,
        koordinatLng: null,
        sira: 0,
      },
    });
  }

  for (const row of ROTALAR_SEED) {
    const existing = await prisma.turizmRotasi.findFirst({
      where: { belediyeId, baslik: row.baslik },
    });
    if (existing) continue;
    await prisma.turizmRotasi.create({
      data: {
        ...row,
        belediyeId,
        galeriUrls: [],
        kapakFotoUrl: null,
      },
    });
  }

  for (const row of ETKINLIK_SEED) {
    const existing = await prisma.etkinlik.findFirst({
      where: { belediyeId, baslik: row.baslik },
    });
    if (existing) continue;
    await prisma.etkinlik.create({
      data: {
        ...row,
        belediyeId,
        kapakFotoUrl: null,
      },
    });
  }

  for (const row of HABER_SEED) {
    const existing = await prisma.haber.findFirst({
      where: { belediyeId, baslik: row.baslik },
    });
    if (existing) continue;
    await prisma.haber.create({
      data: {
        ...row,
        belediyeId,
        kapakFotoUrl: null,
      },
    });
  }

  let tarihiEserEklenen = 0;
  for (const row of ESER_SEED) {
    const existing = await prisma.tarihiEser.findFirst({
      where: { belediyeId, isim: row.isim },
    });
    if (existing) continue;
    await prisma.tarihiEser.create({
      data: {
        isim: row.isim,
        donem: row.donem ?? null,
        kisaAciklama: row.kisaAciklama ?? null,
        detayliAciklama: row.detayliAciklama ?? null,
        koordinatLat: row.koordinatLat ?? null,
        koordinatLng: row.koordinatLng ?? null,
        yayinda: row.yayinda ?? true,
        belediyeId,
        galeriUrls: [],
        ekVideolar: [],
        kapakFotoUrl: null,
        videoUrl: null,
        vrIcerikId: null,
      },
    });
    tarihiEserEklenen += 1;
  }
  if (tarihiEserEklenen === 5) {
    console.log("✅ 5 tarihi eser eklendi");
  } else if (tarihiEserEklenen > 0) {
    console.log(`✅ ${tarihiEserEklenen} tarihi eser eklendi`);
  } else {
    console.log("ℹ️ Tarihi eser kayıtları (isim) zaten mevcut, atlandı.");
  }

  const tarihceData = {
    baslik: "Bergama'nın Tarihi",
    icerik:
      "Bergama (antik adıyla Pergamon), MÖ 3. yüzyıldan itibaren Anadolu'nun en önemli kültür ve bilim merkezlerinden biri olmuştur. Attalos hanedanlığı döneminde altın çağını yaşayan kent, dönemin en büyük kütüphanelerinden birine ev sahipliği yapmıştır. Roma İmparatorluğu döneminde de önemini koruyan Bergama, bugün UNESCO Dünya Mirası listesinde yer almakta ve her yıl binlerce turisti ağırlamaktadır.",
    kapakFotoUrl: null,
    galeriUrls: [],
    yayinda: true,
  };

  const tarihceRow = await prisma.tarihce.findFirst({
    where: { belediyeId },
    orderBy: { id: "desc" },
  });
  if (tarihceRow) {
    await prisma.tarihce.update({
      where: { id: tarihceRow.id },
      data: tarihceData,
    });
  } else {
    await prisma.tarihce.create({
      data: { ...tarihceData, belediyeId },
    });
  }

  const baskanData = {
    baskanAdi: "Hakan Avcı",
    unvan: "Bergama Belediye Başkanı",
    mesaj:
      "Köklü tarihi, eşsiz doğası ve sıcakkanlı insanlarıyla Bergama'ya hoş geldiniz. Helenistik dönemden günümüze uzanan bu kadim topraklarda her adımınızda tarihin izlerini hissedeceksiniz. Keşif uygulamamız aracılığıyla şehrimizin tüm güzelliklerini keşfetmenizi diliyor, Bergama adına sizi en içten duygularla selamlıyorum.",
    fotografUrl: null,
  };

  const baskanRow = await prisma.baskanMesaji.findFirst({
    where: { belediyeId },
    orderBy: { id: "desc" },
  });
  if (baskanRow) {
    await prisma.baskanMesaji.update({
      where: { id: baskanRow.id },
      data: baskanData,
    });
  } else {
    await prisma.baskanMesaji.create({
      data: { ...baskanData, belediyeId },
    });
  }
}

async function main() {
  const belediye = await prisma.belediye.upsert({
    where: { slug: "bergama" },
    create: {
      slug: "bergama",
      ad: "Bergama Belediyesi",
      anaRenk: "#8B0000",
      ikinciRenk: "#2c3e50",
    },
    update: {
      ad: "Bergama Belediyesi",
      anaRenk: "#8B0000",
      ikinciRenk: "#2c3e50",
      aktif: true,
    },
  });

  const sifreHash = await bcrypt.hash(ADMIN_PASSWORD, 10);

  await prisma.kullanici.upsert({
    where: {
      email_belediyeId: {
        email: ADMIN_EMAIL,
        belediyeId: belediye.id,
      },
    },
    create: {
      email: ADMIN_EMAIL,
      sifre: sifreHash,
      ad: "Bergama Admin",
      rol: "ADMIN",
      belediyeId: belediye.id,
      aktif: true,
    },
    update: {
      sifre: sifreHash,
      ad: "Bergama Admin",
      rol: "ADMIN",
      aktif: true,
    },
  });

  await seedBergamaDemoContent();

  console.log("✅ Bergama belediyesi ve admin kullanıcısı oluşturuldu");
  console.log("📧 Email: admin@bergama.bel.tr");
  console.log("🔑 Şifre: Bergama2024!");
  console.log("✅ Örnek içerikler (yeme-içme, rotalar, etkinlikler, haberler, eserler, tarihçe, başkan) eklendi veya güncellendi.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
