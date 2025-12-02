// controllers/admin/mainvideo.js (or adminLiveController.js)
const MainLive = require("../../models/main_video"); // Your model path
const { unlinkSync } = require('fs');

const fs =require("fs")
const path = require('path');

// GET: Show edit/create form (only one record - handles both display for update/create)
exports.getAdminLive = async (req, res) => {
  try {
    const live = await MainLive.findOne().sort({ createdAt: -1 });
    res.render("admin/live-edit", { 
      live, 
      pageTitle: "Edit Main Live Video",
      user: req.user,
      messages: {
        success: req.flash('success')[0],
        error: req.flash('error')[0]
      }
    });
  } catch (err) {
    console.error(err);
    req.flash('error', 'Server Error');
    res.redirect('/admin/main');
  }
};

// POST: UPSERT (Create new if none exists, Update if exists) - ONE METHOD HANDLES BOTH
exports.postAdminLive = async (req, res) => {
  try {
    const { title, marqueeText, videoUrl, posterUrl, isActive, expiresAt } = req.body;

    // Handle file uploads (prioritize files over URLs)
    const videoFile = req.files?.videoFile?.[0];
    const posterFile = req.files?.posterFile?.[0];

    const finalVideoUrl = videoFile ? `/uploads/main/${videoFile.filename}` : (videoUrl || '');
    const finalPosterUrl = posterFile ? `/uploads/main/${posterFile.filename}` : posterUrl;

    // Find existing (latest) or create new - UPSERT LOGIC
    let live = await MainLive.findOne().sort({ createdAt: -1 });

    if (live) {
      // UPDATE EXISTING
      live.title = title;
      live.marqueeText = marqueeText;
      live.videoUrl = finalVideoUrl || live.videoUrl; // Keep existing if no new video
      live.poster = finalPosterUrl || live.poster; // Keep existing if no new poster
      live.isActive = isActive === "on";
      live.expiresAt = expiresAt ? new Date(expiresAt) : null;
    } else {
      // CREATE NEW (first time)
      if (!finalVideoUrl) {
        throw new Error('Video URL or file is required!');
      }
      live = new MainLive({
        title,
        marqueeText,
        videoUrl: finalVideoUrl,
        poster: finalPosterUrl || "https://i.imgur.com/0z8K8pP.jpg",
        isActive: isActive === "on",
        expiresAt: expiresAt ? new Date(expiresAt) : null
      });
    }

    await live.save();
    req.flash("success", live._id ? "Main Live Video Updated Successfully!" : "Main Live Video Created Successfully!");
    res.redirect("/admin/main");
  } catch (err) {
    console.error(err);
    // Clean up uploaded files on error
    if (req.files?.videoFile?.[0]) {
      unlinkSync(req.files.videoFile[0].path);
    }
    if (req.files?.posterFile?.[0]) {
      unlinkSync(req.files.posterFile[0].path);
    }
    req.flash("error", err.message || "Failed to save. Check video URL or file.");
    res.redirect("/admin/main");
  }
};


const ffmpeg = require("fluent-ffmpeg");
const ffmpegStatic = require("ffmpeg-static");
const { createCanvas, loadImage } = require("canvas");
ffmpeg.setFfmpegPath(ffmpegStatic);

exports.downloadVideoWithOverlay = async (req, res) => {
  try {
    const news = await MainLive.findById(req.params.id);
    // if (!news || news.mediaType !== "video" || !news.video) {

    //   req.flash("error", "No video found");
    //   return res.redirect("/admin/main");
    // }
console.log("news",news)
    // file paths
    const videoPath = path.join(__dirname, "../../../uploads/main", path.basename(news.videoUrl));
    console.log("video",videoPath)
    const tempDir = path.join(__dirname, "../../../temp");
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

    // overlay and output names
    const overlayPath = path.join(tempDir, `overlay_${news._id}.png`);
    const outputPath = path.join(tempDir, `ETimes_${news._id}_${Date.now()}.mp4`);

    const breakingTag = path.join(__dirname, "../../../public/logo/tag.png");
    const etimesLogo = path.join(__dirname, "../../../public/logo/logo.png");

    if (!fs.existsSync(videoPath)) {
      req.flash("error", "Video file missing");
      return res.redirect("/admin/main");
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
    ctx.fillText(liveTime, W - 12, topBarH - 3);

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
        return res.redirect("/admin/main");
      })
      .save(outputPath);

  } catch (err) {
    console.error("SERVER ERROR:", err);
    req.flash("error", "Something went wrong");
    return res.redirect("/admin/main");
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