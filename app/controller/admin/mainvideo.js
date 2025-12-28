// controllers/admin/mainvideo.js

const MainLive = require("../../models/main_video");
const fs = require("fs");
const path = require("path");
const os = require("os");
const ffmpeg = require("fluent-ffmpeg");
const { createCanvas } = require("canvas");

// ===============================
// 🔒 LOCK FFMPEG & FFPROBE PATHS
// ===============================
ffmpeg.setFfmpegPath(
  "/var/www/etimes/etimesindia24newschannel/node_modules/ffmpeg-static/ffmpeg"
);
ffmpeg.setFfprobePath("/usr/local/bin/ffprobe");

console.log("FFmpeg & FFprobe paths locked");

// ===============================
// GET ADMIN LIVE
// ===============================
exports.getAdminLive = async (req, res) => {
  try {
    const live = await MainLive.findOne();
    res.render("admin/live-edit", {
      live,
      pageTitle: "Edit Main Live Video",
      user: req.user,
      messages: {
        success: req.flash("success")[0],
        error: req.flash("error")[0],
      },
    });
  } catch (err) {
    console.error(err);
    req.flash("error", "Server Error");
    res.redirect("/admin/main");
  }
};

// ===============================
// POST ADMIN LIVE
// ===============================
exports.postAdminLive = async (req, res) => {
  try {
    const { title, marqueeText, videoUrl, posterUrl, isActive, expiresAt } =
      req.body;

    const videoFile = req.files?.videoFile?.[0];
    const posterFile = req.files?.posterFile?.[0];

    const finalVideoUrl = videoFile
      ? `/uploads/main/${videoFile.filename}`
      : videoUrl || "";

    const finalPosterUrl = posterFile
      ? `/uploads/main/${posterFile.filename}`
      : posterUrl;

    let live = await MainLive.findOne().sort({ createdAt: -1 });
    if (!live) live = new MainLive({});

    live.title = title;
    live.marqueeText = marqueeText;
    live.videoUrl = finalVideoUrl || live.videoUrl;
    live.poster =
      finalPosterUrl || live.poster || "https://i.imgur.com/0z8K8pP.jpg";
    live.isActive = isActive === "on";
    live.expiresAt = expiresAt ? new Date(expiresAt) : null;

    await live.save();

    req.flash("success", "Main Live Video Saved Successfully");
    res.redirect("/admin/main");
  } catch (err) {
    console.error(err);
    req.flash("error", err.message);
    res.redirect("/admin/main");
  }
};

// ===============================
// FONT PATH (LINUX SAFE)
// ===============================
function getFontPath() {
  const fonts = [
    "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
    "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf",
    "/usr/share/fonts/truetype/ubuntu/Ubuntu-B.ttf",
  ];
  for (const f of fonts) if (fs.existsSync(f)) return f;
  return fonts[0];
}

// ===============================
// DOWNLOAD VIDEO WITH OVERLAY
// ===============================
exports.downloadVideoWithOverlay = async (req, res) => {
  try {
    const news = await MainLive.findById(req.params.id);
    if (!news || !news.videoUrl) {
      req.flash("error", "Video not found");
      return res.redirect("/admin/main");
    }

    const videoPath = path.join(__dirname, "../../../", news.videoUrl);
    const tempDir = path.join(__dirname, "../../../temp");
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

    const overlayPath = path.join(tempDir, `overlay_${Date.now()}.png`);
    const outputPath = path.join(tempDir, `ETimes_${Date.now()}.mp4`);
    const tickerFile = path.join(tempDir, `ticker_${Date.now()}.txt`);

    // 🔥 WRITE TICKER TEXT FILE (Unicode safe)
    fs.writeFileSync(
      tickerFile,
      (news.marqueeText || news.title || "").replace(/\r?\n/g, " "),
      "utf8"
    );

    // ===============================
    // GET VIDEO METADATA
    // ===============================
    const metadata = await new Promise((resolve, reject) => {
      ffmpeg.ffprobe(videoPath, (err, data) =>
        err ? reject(err) : resolve(data)
      );
    });

    const stream = metadata.streams.find((s) => s.codec_type === "video");
    const W = stream.width;
    const H = stream.height;

    // ===============================
    // CREATE OVERLAY IMAGE
    // ===============================
    const canvas = createCanvas(W, H);
    const ctx = canvas.getContext("2d");

    const topBarH = Math.floor(H * 0.1);
    const tickerH = Math.floor(H * 0.06);

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, W, topBarH);

    ctx.fillStyle = "#8B0000";
    ctx.fillRect(0, H - tickerH, W, tickerH);

    fs.writeFileSync(overlayPath, canvas.toBuffer("image/png"));

    // ===============================
    // 🔥 OBJECT BASED complexFilter (FINAL FIX)
    // ===============================
    const fontFile = getFontPath();
    const scrollSpeed = Math.floor(W / 8);

    ffmpeg(videoPath)
      .input(overlayPath)
      .complexFilter(
        [
          {
            filter: "scale",
            options: {
              w: W,
              h: H,
              force_original_aspect_ratio: "decrease",
            },
            inputs: "0:v",
            outputs: "v1",
          },
          {
            filter: "pad",
            options: {
              w: W,
              h: H,
              x: "(ow-iw)/2",
              y: "(oh-ih)/2",
              color: "black",
            },
            inputs: "v1",
            outputs: "v2",
          },
          {
            filter: "overlay",
            options: { x: 0, y: 0 },
            inputs: ["v2", "1:v"],
            outputs: "base",
          },
          {
            filter: "drawtext",
            options: {
              fontfile: fontFile,
              textfile: tickerFile,
              fontcolor: "white",
              fontsize: Math.floor(tickerH * 0.55),
              x: `w-mod(t*${scrollSpeed},w+tw)`,
              y: H - tickerH + Math.floor(tickerH * 0.3),
              shadowcolor: "black",
              shadowx: 2,
              shadowy: 2,
            },
            inputs: "base",
            outputs: "out",
          },
        ],
        "out"
      )
      .outputOptions([
        "-map",
        "[out]",
        "-map",
        "0:a?",
        "-c:v",
        "libx264",
        "-preset",
        "medium",
        "-crf",
        "20",
        "-c:a",
        "aac",
        "-b:a",
        "192k",
        "-pix_fmt",
        "yuv420p",
      ])
      .on("end", () => {
        res.download(outputPath, () => {
          [overlayPath, outputPath, tickerFile].forEach((f) => {
            try {
              fs.unlinkSync(f);
            } catch {}
          });
        });
      })
      .on("error", (err) => {
        console.error("FFmpeg ERROR:", err.message);
        req.flash("error", err.message);
        res.redirect("/admin/main");
      })
      .save(outputPath);
  } catch (err) {
    console.error(err);
    req.flash("error", err.message);
    res.redirect("/admin/main");
  }
};
