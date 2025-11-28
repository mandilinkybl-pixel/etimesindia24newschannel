const sports = require("../../models/Sports");
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
          image = `/uploads/sports/${file.filename}`;
          mediaType = "image";
        } else if (file.mimetype.startsWith("video/")) {
          video = `/uploads/sports/${file.filename}`;
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

    await sports.create(data);

    req.flash("success", "News created successfully!");
    res.redirect("/admin/sports");

  } catch (err) {
    console.error("CREATE ERROR:", err);
    req.flash("error", err.message || "Failed to create news");
    res.redirect("/admin/sports/create");
  }
};


// GET - Edit form
exports.getEditNews = async (req, res) => {
  try {
    const news = await sports.findById(req.params.id);
    if (!news) {
      req.flash("error", "News not found");
      return res.redirect("/admin/sports");
    }

    res.render("admin/update", {
      title: "sports",
      news,
      user: req.user,
      errors: [],
    });
  } catch (err) {
    req.flash("error", "Error loading news");
    res.redirect("/admin/sports");
  }
};

// POST - Update news
exports.postUpdateNews = async (req, res) => {
  try {
    const news = await sports.findById(req.params.id);
    if (!news) {
      req.flash("error", "News not found");
      return res.redirect("/admin/sports");
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
          image = `/uploads/sports/${file.filename}`;
          mediaType = "image";
        } else if (file.mimetype.startsWith("video/")) {
          video = `/uploads/sports/${file.filename}`;
          mediaType = "video";
        }
      });
    }

    const highlights = highlightText
      ? highlightText.split("\n").filter((h) => h.trim())
      : [];

    await sports.findByIdAndUpdate(req.params.id, {
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
    res.redirect("/admin/sports");
  } catch (err) {
    req.flash("error", err.message || "Update failed");
    res.redirect(`/admin/sports/edit/${req.params.id}`);
  }
};

// DELETE - Delete news
exports.deleteNews = async (req, res) => {
  try {
    const news = await sports.findById(req.params.id);
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

    await sports.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "News deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


const ffmpeg = require("fluent-ffmpeg");
const ffmpegStatic = require("ffmpeg-static");
const { createCanvas, loadImage } = require("canvas");
ffmpeg.setFfmpegPath(ffmpegStatic);

exports.downloadVideoWithOverlay = async (req, res) => {
  try {
    const news = await sports.findById(req.params.id);
    if (!news || news.mediaType !== "video" || !news.video) {
      req.flash("error", "No video found");
      return res.redirect("/admin/sports");
    }

    // file paths
    const videoPath = path.join(__dirname, "../../../uploads/sports", path.basename(news.video));
    const tempDir = path.join(__dirname, "../../../temp");
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

    // overlay and output names
    const overlayPath = path.join(tempDir, `overlay_${news._id}.png`);
    const outputPath = path.join(tempDir, `ETimes_${news._id}_${Date.now()}.mp4`);

    const breakingTag = path.join(__dirname, "../../../public/logo/tag.png");
    const etimesLogo = path.join(__dirname, "../../../public/logo/logo.png");

    if (!fs.existsSync(videoPath)) {
      req.flash("error", "Video file missing");
      return res.redirect("/admin/sports");
    }

    /* ----------------------------------------------------------
       0) GET REAL VIDEO WIDTH & HEIGHT USING FFMPEG PROBE
       ----------------------------------------------------------*/
    const metadata = await new Promise((resolve, reject) => {
      ffmpeg.ffprobe(videoPath, (err, data) => {
        if (err) reject(err);
        else resolve(data);
      });
    });

    const stream = metadata.streams.find(s => s.width && s.height);
    const W = stream.width;
    const H = stream.height;

    console.log("VIDEO SIZE:", W, "x", H);

    /* ----------------------------------------------------------
       1) CREATE OVERLAY CANVAS (SAME SIZE AS VIDEO)
       ----------------------------------------------------------*/
    const canvas = createCanvas(W, H);
    const ctx = canvas.getContext("2d");

    ctx.clearRect(0, 0, W, H);

    // dynamic top bar + ticker height based on video size
    const topBarH = Math.floor(H * 0.08);
    const tickerH = Math.floor(H * 0.05);

    // top white bar
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, W, topBarH);

    // Breaking tag logo
    try {
      const tagImg = await loadImage(breakingTag);
      ctx.drawImage(tagImg, 10, 10, topBarH * 2.2, topBarH * 0.8);
    } catch (e) {}

    // Headline text
   // Headline text (MAROON, BOLD, BIGGER)
ctx.fillStyle = "#680505ff";
ctx.font = `bold ${Math.floor(topBarH * 0.55)}px Arial`;
ctx.textAlign = "center";
ctx.fillText((news.headline || "").substring(0, 60).toUpperCase(), W / 2, topBarH * 0.72);


    // ETimes Logo
    try {
      const logoImg = await loadImage(etimesLogo);
      const logoW = topBarH * 1.5;
      const logoH = topBarH * 0.6;
      ctx.drawImage(logoImg, W - logoW - 10, 10, logoW, logoH);
    } catch (e) {}

    // Live clock
    const now = new Date();
    const liveTime = `${now.getHours().toString().padStart(2,"0")}:${now.getMinutes().toString().padStart(2,"0")}:${now.getSeconds().toString().padStart(2,"0")}`;
    ctx.fillStyle = "#b30000";
    ctx.font = `bold ${Math.floor(topBarH * 0.25)}px Arial`;
    ctx.textAlign = "right";
    ctx.fillText(liveTime, W - 8, topBarH - 3);

    // Bottom red ticker bar
    ctx.fillStyle = "#8B0000";
    ctx.fillRect(0, H - tickerH, W, tickerH);

    // Save overlay
    fs.writeFileSync(overlayPath, canvas.toBuffer("image/png"));

    /* ----------------------------------------------------------
       2) TEXT CLEANING
       ----------------------------------------------------------*/
    const cleanText = (txt) =>
      (txt || "")
        .replace(/'/g, "′")
        .replace(/:/g, " - ")
        .replace(/"/g, "'")
        .replace(/\|/g, " ")
        .replace(/;/g, ",")
        .replace(/\\/g, "/");

    const tickerText = cleanText(news.ticker || `BREAKING NEWS  | ${news.headline || ""}`);

    const fontFile = "C\\:/Windows/Fonts/arialbd.ttf";
;

    /* ----------------------------------------------------------
       3) FFMPEG FILTER (DYNAMIC SIZE)
       ----------------------------------------------------------*/
    const filterLines = [
  `[0:v]scale=${W}:${H}:force_original_aspect_ratio=decrease,pad=${W}:${H}:(ow-iw)/2:(oh-ih)/2:black[vid]`,
  `[vid][1:v]overlay=0:0[base]`,

  // Live clock (DYNAMIC)
  `[base]drawtext=fontfile=${fontFile}:text='%{localtime\\:%H\\\\:%M\\\\:%S}':
   fontcolor=red:fontsize=${Math.floor(topBarH * 0.30)}:
   x=w-tw-20:y=10[base2]`,

 // Ticker with typing effect + border color
// Ticker text (bold, no border, slow scrolling)
`[base2]drawtext=fontfile=${fontFile}:
 text='${escapeFFmpegText(tickerText.toUpperCase())}':
 fontcolor=white:
 fontsize=${Math.floor(tickerH * 0.60)}:
 x=w-mod(t*40\\, w+tw):
 y=${H - tickerH + tickerH * 0.25}[final]`




];


    const complexFilter = filterLines.join(";");

    /* ----------------------------------------------------------
       4) RUN FFMPEG
       ----------------------------------------------------------*/
    ffmpeg(videoPath)
      .input(overlayPath)
      .complexFilter(complexFilter)
      .outputOptions([
        "-map", "[final]",
        "-map", "0:a?",
        "-c:v", "libx264",
        "-preset", "veryfast",
        "-crf", "22",
        "-c:a", "aac",
        "-b:a", "128k",
        "-movflags", "+faststart",
      ])
      .on("end", () => {
        res.download(outputPath, `ETimes_${Date.now()}.mp4`, () => {
          try { fs.unlinkSync(overlayPath); } catch {}
          try { fs.unlinkSync(outputPath); } catch {}
        });
      })
      .on("error", (err) => {
        console.error("FFmpeg ERROR:", err.message);
        req.flash("error", "Video export failed");
        return res.redirect("/admin/sports");
      })
      .save(outputPath);

  } catch (err) {
    console.error("SERVER ERROR:", err);
    req.flash("error", "Something went wrong");
    return res.redirect("/admin/sports");
  }
};

function escapeFFmpegText(t) {
  if (!t) return "";
  return String(t)
    .replace(/\\/g, "/")
    .replace(/'/g, "\\'")
    .replace(/:/g, " -")
    .replace(/\n/g, " ");
}