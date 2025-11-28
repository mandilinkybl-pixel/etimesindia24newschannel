const rightads = require("../../models/rightad");
const fs = require("fs");
const path = require("path");

// ----------------- SHOW PAGE -----------------
exports.getrightadsPage = async (req, res) => {
  try {
    const ad = await rightads.find().sort({ createdAt: -1 });
    res.render("admin/rightads", { rightads :ad ,user:req.user });
  } catch (err) {
    console.log(err);
    res.status(500).send("Server Error");
  }
};

// ----------------- CREATE -----------------
exports.createrightads = async (req, res) => {
  try {
    if (!req.file) return res.send("No file uploaded");

    const mediaType = req.file.mimetype.startsWith("image") ? "image" : "video";

    await rightads.create({
      title: req.body.title,
      mediaType,
      mediaUrl: req.file.path.replace(/\\/g, "/"),
      link: req.body.link || null,
      status: req.body.status || "active",
    });

    res.redirect("/admin/rightads");
  } catch (err) {
    console.log(err);
    res.status(500).send("Error creating rightads");
  }
};

// ----------------- UPDATE -----------------
exports.updaterightads = async (req, res) => {
  try {
    const ad = await rightads.findById(req.params.id);
    if (!ad) return res.status(404).send("rightads not found");

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

    res.redirect("/admin/rightads");
  } catch (err) {
    console.log(err);
    res.status(500).send("Error updating rightads");
  }
};

// ----------------- DELETE -----------------
exports.deleterightads = async (req, res) => {
  try {
    const ad = await rightads.findById(req.params.id);
    if (!ad) return res.status(404).send("rightads not found");

    if (fs.existsSync(ad.mediaUrl)) fs.unlinkSync(ad.mediaUrl);

    await rightads.findByIdAndDelete(req.params.id);

    res.redirect("/admin/rightads");
  } catch (err) {
    console.log(err);
    res.status(500).send("Error deleting rightads");
  }
};
