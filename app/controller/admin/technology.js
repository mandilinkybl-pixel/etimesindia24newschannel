const tech = require("../../models/Technology");
const fs = require("fs");
const path = require("path");


// POST - Create news
exports.postCreateNews = async (req, res) => {
  try {
    const {
      headline,
      location,
      description,
      highlightText,
      externalLink,
      status,
    } = req.body;

    console.log("Form Body:", req.body);
    console.log("Uploaded Files:", req.files);

    let image = null;
    let video = null;
    let mediaType = "none";

    if (req.files && req.files.length > 0) {
      req.files.forEach((file) => {
        if (file.mimetype.startsWith("image/")) {
          image = `/uploads/tech/${file.filename}`;
          mediaType = "image";
        } else if (file.mimetype.startsWith("video/")) {
          video = `/uploads/tech/${file.filename}`;
          mediaType = "video";
        }
      });
    }

    const highlights = highlightText
      ? highlightText.split("\n").filter((h) => h.trim())
      : [];

    const data = {
      headline,
      location,
      description,
      highlightText: highlights,
      mediaType,
      image,
      video,
      externalLink: externalLink || null,
      status: status || "draft",
      createdBy: req.user.id,
    };

    console.log("Saving Data:", data);

    await tech.create(data);

    req.flash("success", "News created successfully!");
    res.redirect("/admin/tech");

  } catch (err) {
    console.error("CREATE ERROR:", err);
    req.flash("error", err.message || "Failed to create news");
    res.redirect("/admin/tech/create");
  }
};


// GET - Edit form
exports.getEditNews = async (req, res) => {
  try {
    const news = await tech.findById(req.params.id);
    if (!news) {
      req.flash("error", "News not found");
      return res.redirect("/admin/tech");
    }

    res.render("admin/update", {
      title: "tech",
      news,
      user: req.user,
      errors: [],
    });
  } catch (err) {
    req.flash("error", "Error loading news");
    res.redirect("/admin/tech");
  }
};

// POST - Update news
exports.postUpdateNews = async (req, res) => {
  try {
    const news = await tech.findById(req.params.id);
    if (!news) {
      req.flash("error", "News not found");
      return res.redirect("/admin/tech");
    }

    const {
      headline,
      location,
      description,
      highlightText,
      externalLink,
      status,
    } = req.body;

    let image = news.image;
    let video = news.video;
    let mediaType = news.mediaType;

    // Handle new file uploads
    if (req.files && req.files.length > 0) {
      // Delete old files if new ones uploaded
      if (image && req.files.some((f) => f.mimetype.startsWith("image"))) {
        const oldPath = path.join(__dirname, "..", image);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
      if (video && req.files.some((f) => f.mimetype.startsWith("video"))) {
        const oldPath = path.join(__dirname, "..", video);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }

      req.files.forEach((file) => {
        if (file.mimetype.startsWith("image/")) {
          image = `/uploads/tech/${file.filename}`;
          mediaType = "image";
        } else if (file.mimetype.startsWith("video/")) {
          video = `/uploads/tech/${file.filename}`;
          mediaType = "video";
        }
      });
    }

    const highlights = highlightText
      ? highlightText.split("\n").filter((h) => h.trim())
      : [];

    await tech.findByIdAndUpdate(req.params.id, {
      headline,
      location,
      description,
      highlightText: highlights,
      mediaType,
      image,
      video,
      externalLink: externalLink || null,
      status,
    });

    req.flash("success", "News updated successfully updated!");
    res.redirect("/admin/tech");
  } catch (err) {
    req.flash("error", err.message || "Update failed");
    res.redirect(`/admin/tech/edit/${req.params.id}`);
  }
};

// DELETE - Delete news
exports.deleteNews = async (req, res) => {
  try {
    const news = await tech.findById(req.params.id);
    if (!news) {
      return res.status(404).json({ success: false, message: "News not found" });
    }

    // Delete associated files
    if (news.image) {
      const imgPath = path.join(__dirname, "..", news.image);
      if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
    }
    if (news.video) {
      const vidPath = path.join(__dirname, "..", news.video);
      if (fs.existsSync(vidPath)) fs.unlinkSync(vidPath);
    }

    await tech.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "News deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};