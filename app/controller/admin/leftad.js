const leftad = require("../../models/leftad");
const fs = require("fs");
const path = require("path");

// ----------------- SHOW PAGE -----------------
exports.getleftadPage = async (req, res) => {
  try {
    const ad = await leftad.find().sort({ createdAt: -1 });
    res.render("admin/leftad", { leftad :ad ,user:req.user });
  } catch (err) {
    console.log(err);
    res.status(500).send("Server Error");
  }
};

// ----------------- CREATE -----------------
exports.createleftad = async (req, res) => {
  try {
    if (!req.file) return res.send("No file uploaded");

    const mediaType = req.file.mimetype.startsWith("image") ? "image" : "video";

    await leftad.create({
      title: req.body.title,
      mediaType,
      mediaUrl: req.file.path.replace(/\\/g, "/"),
      link: req.body.link || null,
      status: req.body.status || "active",
    });

    res.redirect("/admin/leftad");
  } catch (err) {
    console.log(err);
    res.status(500).send("Error creating leftad");
  }
};

// ----------------- UPDATE -----------------
exports.updateleftad = async (req, res) => {
  try {
    const ad = await leftad.findById(req.params.id);
    if (!ad) return res.status(404).send("leftad not found");

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

    res.redirect("/admin/leftad");
  } catch (err) {
    console.log(err);
    res.status(500).send("Error updating leftad");
  }
};

// ----------------- DELETE -----------------
exports.deleteleftad = async (req, res) => {
  try {
    const ad = await leftad.findById(req.params.id);
    if (!ad) return res.status(404).send("leftad not found");

    if (fs.existsSync(ad.mediaUrl)) fs.unlinkSync(ad.mediaUrl);

    await leftad.findByIdAndDelete(req.params.id);

    res.redirect("/admin/leftad");
  } catch (err) {
    console.log(err);
    res.status(500).send("Error deleting leftad");
  }
};
