const National = require("../../models/National");
const fs = require("fs");
const path = require("path");
const ffmpeg = require("fluent-ffmpeg");
const ffmpegStatic = require("ffmpeg-static");
const { createCanvas, loadImage } = require("canvas");
ffmpeg.setFfmpegPath(ffmpegStatic);

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
          image = `/uploads/national/${file.filename}`;
          mediaType = "image";
        } else if (file.mimetype.startsWith("video/")) {
          video = `/uploads/national/${file.filename}`;
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

    await National.create(data);

    req.flash("success", "News created successfully!");
    res.redirect("/admin/national");

  } catch (err) {
    console.error("CREATE ERROR:", err);
    req.flash("error", err.message || "Failed to create news");
    res.redirect("/admin/national/create");
  }
};


// GET - Edit form
exports.getEditNews = async (req, res) => {
  try {
    const news = await National.findById(req.params.id);
    if (!news) {
      req.flash("error", "News not found");
      return res.redirect("/admin/national");
    }

    res.render("admin/update", {
      title: "national",
      news,
      user: req.user,
      errors: [],
    });
  } catch (err) {
    req.flash("error", "Error loading news");
    res.redirect("/admin/national");
  }
};

// POST - Update news
exports.postUpdateNews = async (req, res) => {
  try {
    const news = await National.findById(req.params.id);
    if (!news) {
      req.flash("error", "News not found");
      return res.redirect("/admin/national");
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
          image = `/uploads/national/${file.filename}`;
          mediaType = "image";
        } else if (file.mimetype.startsWith("video/")) {
          video = `/uploads/national/${file.filename}`;
          mediaType = "video";
        }
      });
    }

    const highlights = highlightText
      ? highlightText.split("\n").filter((h) => h.trim())
      : [];

    await National.findByIdAndUpdate(req.params.id, {
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
    res.redirect("/admin/national");
  } catch (err) {
    req.flash("error", err.message || "Update failed");
    res.redirect(`/admin/national/edit/${req.params.id}`);
  }
};

// DELETE - Delete news
exports.deleteNews = async (req, res) => {
  try {
    const news = await National.findById(req.params.id);
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

    await National.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "News deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};



exports.downloadVideoWithOverlay = async (req, res) => {
  try {
    const news = await National.findById(req.params.id);
    if (!news || news.mediaType !== "video" || !news.video) {
      req.flash("error", "No video found");
      return res.redirect("/admin/national");
    }

    // file paths
    const videoPath = path.join(__dirname, "../../../uploads/national", path.basename(news.video));
    const tempDir = path.join(__dirname, "../../../temp");
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

    // overlay and output names
    const overlayPath = path.join(tempDir, `overlay_${news._id}.png`);
    const outputPath = path.join(tempDir, `ETimes_${news._id}_${Date.now()}.mp4`);

    // default logos (change if your files are named differently)
    const breakingTag = path.join(__dirname, "../../../public/logo/tag.png");      // left
    const etimesLogo = path.join(__dirname, "../../../public/logo/logo.png");     // right

    // sanity check video exists
    if (!fs.existsSync(videoPath)) {
      req.flash("error", "Video file missing");
      return res.redirect("/admin/national");
    }

    /* ---------------------------
       1) CREATE OVERLAY USING CANVAS
       ---------------------------*/
    // 720x1280 portrait as per screenshot
    const W = 720, H = 1280;
    const canvas = createCanvas(W, H);
    const ctx = canvas.getContext("2d");

    // Transparent background (so video shows through)
    ctx.clearRect(0, 0, W, H);

    // TOP WHITE BAR (height ~60)
    const topBarH = 60;
    ctx.fillStyle = "#ffffff";
    roundRect(ctx, 0, 0, W, topBarH, 0, true, false); // flat corners

    // Breaking tag (left)
    try {
      const tagImg = await loadImage(breakingTag);
      // scale to fit ~120x46
      const tagW = 140, tagH = 46;
      ctx.drawImage(tagImg, 8, 7, tagW, tagH);
    } catch (e) {
      // ignore if missing
    }

    // Center Headline (fits in top bar)
    ctx.fillStyle = "#b30000"; // small accent used for centered text, but heading mostly black
    ctx.font = "bold 20px Arial";
    ctx.textAlign = "center";
    // headline: crop to reasonable length for top bar
    const topHeadline = (news.headline || "").substring(0, 40);
    ctx.fillStyle = "black";
    ctx.fillText(topHeadline, W / 2, 38);

    // Right: ETIMES logo and clock
    try {
      const logoImg = await loadImage(etimesLogo);
      const logoW = 110, logoH = 36;
      ctx.drawImage(logoImg, W - logoW - 8, 10, logoW, logoH);
    } catch (e) {}

    // Clock (current time) - 24 hour HH:MM:SS
    const now = new Date();
    const hh = String(now.getHours()).padStart(2, "0");
    const mm = String(now.getMinutes()).padStart(2, "0");
    const ss = String(now.getSeconds()).padStart(2, "0");
    const liveTime = `${hh}:${mm}:${ss}`;

    ctx.fillStyle = "#b30000";
    ctx.font = "bold 14px Arial";
    ctx.textAlign = "right";
    ctx.fillText(liveTime, W - 10, 54);

    // Bottom ticker background (thick red bar)
    const tickerH = 40;
    ctx.fillStyle = "#8B0000"; // deep red
    ctx.fillRect(0, H - tickerH, W, tickerH);

    // On top of ticker we will not draw the scrolling text in canvas (FFmpeg drawtext will do it),
    // but draw a small left static "play icon" area or label if desired. We'll leave it minimal.

    // Save overlay
    fs.writeFileSync(overlayPath, canvas.toBuffer("image/png"));

    /* ---------------------------
       2) PREPARE TEXT FOR FFMPEG drawtext (ticker)
       ---------------------------*/
    // Text sanitizer (windows-safe)
    const cleanText = (txt) =>
      (txt || "")
        .replace(/'/g, "′")
        .replace(/:/g, " - ")
        .replace(/"/g, "'")
        .replace(/\|/g, " ")
        .replace(/;/g, ",")
        .replace(/\\/g, "/");

    const tickerText = cleanText(news.ticker || `Top National News... | ${news.headline || ""}`);

    /* ---------------------------
       3) FFMPEG COMPLEX FILTER
       - input 0: original video
       - input 1: overlay png (static)
       - overlay at 0:0
       - drawtext for scrolling ticker onto [base]
       ---------------------------*/

    // Windows font (adjust if using other OS). double-escape backslashes for ffmpeg filter string.
    const fontFile = "C\\:/Windows/Fonts/arialbd.ttf";

    // build complex filter:
    // 1. scale input video to fit 720x1280 keeping aspect ratio (letterbox)
    // 2. pad to 720x1280 with black
    // 3. overlay overlay.png at 0,0
    // 4. drawtext for scrolling ticker near bottom (y = H - 22)
    const filterLines = [
      `[0:v]scale=${W}:${H}:force_original_aspect_ratio=decrease,pad=${W}:${H}:(ow-iw)/2:(oh-ih)/2:black[vid]`,
      `[vid][1:v]overlay=0:0[base]`,
      // drawtext: scrolling leftwards: x = w - mod(t*speed\, w + text_w)
      `[base]drawtext=fontfile=${fontFile}:text='${escapeFFmpegText(tickerText)}':fontcolor=white:fontsize=20:borderw=2:box=0:`
      + `x=w-mod(t*120\\,w+text_w):y=${H - Math.floor(tickerH/2) + 6}[final]`
    ];
    const complexFilter = filterLines.join(";");

    /* ---------------------------
       4) RUN FFMPEG -> keep audio
       ---------------------------*/
    ffmpeg(videoPath)
      .input(overlayPath)
      .complexFilter(complexFilter)
      // map the filtered video and the original audio (if present)
      .outputOptions([
        "-map", "[final]",
        "-map", "0:a?",        // copy audio if present; ? prevents error if none
        "-c:v", "libx264",
        "-preset", "veryfast",
        "-crf", "22",
        "-c:a", "aac",
        "-b:a", "128k",
        "-movflags", "+faststart",
      ])
      .on("start", (cmd) => {
        console.log("FFmpeg started:", cmd);
      })
      .on("progress", (progress) => {
        // optional: console.log("Processing:", progress);
      })
      .on("error", (err, stdout, stderr) => {
        console.error("FFmpeg error:", err.message);
        console.error("ffmpeg stderr:", stderr);
        req.flash("error", "Video export failed");
        // cleanup overlay if created
        if (fs.existsSync(overlayPath)) try { fs.unlinkSync(overlayPath); } catch(e) {}
        return res.redirect("/admin/national");
      })
      .on("end", () => {
        console.log("SUCCESS →", outputPath);
        // send file to user
        res.download(outputPath, `ETimes_${Date.now()}.mp4`, (err) => {
          // cleanup temp files; swallow errors
          if (fs.existsSync(overlayPath)) try { fs.unlinkSync(overlayPath); } catch(e) {}
          if (fs.existsSync(outputPath)) try { fs.unlinkSync(outputPath); } catch(e) {}
          if (err) console.error("Download error:", err);
        });
      })
      .save(outputPath);

  } catch (err) {
    console.error("SERVER ERROR:", err);
    req.flash("error", "Something went wrong");
    return res.redirect("/admin/national");
  }
};

/* -----------------------------------------
   Helper: roundRect (for completeness)
   ----------------------------------------- */
function roundRect(ctx, x, y, w, h, r, fill, stroke) {
  if (typeof r === "undefined") r = 5;
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
  if (fill) ctx.fill();
  if (stroke) ctx.stroke();
}

/* -----------------------------------------
   Helper: escape text for ffmpeg drawtext
   (replace single quotes and special chars)
   ----------------------------------------- */
function escapeFFmpegText(t) {
  if (!t) return "";
  // Replace ' with \'
  // Also escape : and , and \ so ffmpeg filter parser doesn't break.
  return String(t)
    .replace(/\\/g, "/")
    .replace(/'/g, "\\'")
    .replace(/:/g, " -")
    .replace(/\n/g, " ");
}
