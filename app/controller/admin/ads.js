const Ads = require("../../models/ads");
const fs = require("fs");
const path = require("path");

// ----------------- SHOW PAGE -----------------
exports.getAdsPage = async (req, res) => {
  try {
    const ads = await Ads.find().sort({ createdAt: -1 });
    res.render("admin/ads", { ads,user:req.user });
  } catch (err) {
    console.log(err);
    res.status(500).send("Server Error");
  }
};

// ----------------- CREATE -----------------
exports.createAds = async (req, res) => {
  try {
    if (!req.file) return res.send("No file uploaded");

    const mediaType = req.file.mimetype.startsWith("image") ? "image" : "video";

    await Ads.create({
      title: req.body.title,
      mediaType,
      mediaUrl: req.file.path.replace(/\\/g, "/"),
      link: req.body.link || null,
      status: req.body.status || "active",
    });

    res.redirect("/admin/ads");
  } catch (err) {
    console.log(err);
    res.status(500).send("Error creating ads");
  }
};

// ----------------- UPDATE -----------------
exports.updateAds = async (req, res) => {
  try {
    const ad = await Ads.findById(req.params.id);
    if (!ad) return res.status(404).send("Ads not found");

    ad.title = req.body.title || ad.title;
    ad.link = req.body.link || null;
    ad.status = req.body.status || ad.status;

    // Replace media if new file uploaded
    if (req.file) {
      if (fs.existsSync(ad.mediaUrl)) {
        fs.unlinkSync(ad.mediaUrl);
      }

      ad.mediaUrl = req.file.path.replace(/\\/g, "/");
      ad.mediaType = req.file.mimetype.startsWith("image") ? "image" : "video";
    }

    await ad.save();

    res.redirect("/admin/ads");
  } catch (err) {
    console.log(err);
    res.status(500).send("Error updating ads");
  }
};

// ----------------- DELETE -----------------
exports.deleteAds = async (req, res) => {
  try {
    const ad = await Ads.findById(req.params.id);
    if (!ad) return res.status(404).send("Ads not found");

    if (fs.existsSync(ad.mediaUrl)) fs.unlinkSync(ad.mediaUrl);

    await Ads.findByIdAndDelete(req.params.id);

    res.redirect("/admin/ads");
  } catch (err) {
    console.log(err);
    res.status(500).send("Error deleting ads");
  }
};
