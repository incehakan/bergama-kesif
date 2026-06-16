const yukle = async (req, res) => {
  try {
    console.log("Yükleme isteği geldi");
    console.log("req.file:", req.file);
    console.log("req.body:", req.body);

    if (!req.file) {
      return res.status(400).json({ error: 'Dosya bulunamadı. Alan adı "dosya" olmalı.' });
    }

    const tip =
      req.body.tip ||
      (["mp4", "mov", "avi"].includes(req.file.originalname.split(".").pop().toLowerCase())
        ? "video"
        : "fotograf");

    const klasor = tip === "video" ? "videolar" : tip === "vr360" ? "vr-360" : "fotograflar";
    const url = `/uploads/${klasor}/${req.file.filename}`;

    console.log("Yüklenen dosya URL:", url);

    return res.json({ url, tip });
  } catch (error) {
    console.error("Yükleme hatası:", error);
    return res.status(500).json({ error: error.message });
  }
};

module.exports = { yukle, uploadFile: yukle };
