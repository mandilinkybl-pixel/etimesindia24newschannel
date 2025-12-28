// controllers/admin/mainvideo.js

// controllers/admin/mainvideo.js

const MainLive = require("../../models/main_video");
const { unlinkSync } = require("fs");
const fs = require("fs");
const path = require("path");
const ffmpeg = require("fluent-ffmpeg");
const ffmpegStatic = require("ffmpeg-static");
const os = require("os");
const { createCanvas, loadImage } = require("canvas");

// ================= FFmpeg PATH FIX =================
if (os.platform() === "win32") {
  ffmpeg.setFfmpegPath(ffmpegStatic);
  ffmpeg.setFfprobePath(require("ffprobe-static").path);
} else {
  ffmpeg.setFfmpegPath(
    "/var/www/etimes/etimesindia24newschannel/node_modules/ffmpeg-static/ffmpeg"
  );
  ffmpeg.setFfprobePath("/usr/local/bin/ffprobe");
}

console.log("FFmpeg & FFprobe paths set");

// ================= DOWNLOAD VIDEO WITH OVERLAY =================
// exports.downloadVideoWithOverlay = async (req, res) => {
//   try {
//     const news = await MainLive.findById(req.params.id);
//     if (!news || !news.videoUrl) {
//       req.flash("error", "No video found");
//       return res.redirect("/admin/main");
//     }

//     const videoPath = path.join(__dirname, "../../../", news.videoUrl);
//     const tempDir = path.join(__dirname, "../../../temp");

//     if (!fs.existsSync(tempDir)) {
//       fs.mkdirSync(tempDir, { recursive: true });
//     }

//     const overlayPath = path.join(tempDir, `overlay_${Date.now()}.png`);
//     const outputPath = path.join(tempDir, `ETimes_${Date.now()}.mp4`);

//     // ========== GET VIDEO METADATA ==========
//     const metadata = await new Promise((resolve, reject) => {
//       ffmpeg.ffprobe(videoPath, (err, data) => {
//         if (err) reject(err);
//         else resolve(data);
//       });
//     });

//     const stream = metadata.streams.find(s => s.codec_type === "video");
//     const W = stream.width;
//     const H = stream.height;

//     console.log(`Video size: ${W}x${H}`);

//     // ========== CREATE OVERLAY IMAGE ==========
//     const canvas = createCanvas(W, H);
//     const ctx = canvas.getContext("2d");

//     const topBarH = Math.floor(H * 0.1);
//     const tickerH = Math.floor(H * 0.08);

//     ctx.clearRect(0, 0, W, H);

//     // ----- TOP BAR -----
//     ctx.fillStyle = "#ffffff";
//     ctx.fillRect(0, 0, W, topBarH);

//     ctx.fillStyle = "#680505";
//     ctx.font = `bold ${Math.floor(topBarH * 0.45)}px Arial`;
//     ctx.textAlign = "center";
//     ctx.textBaseline = "middle";

//     const headline = (news.title || "BREAKING NEWS").toUpperCase();
//     ctx.fillText(headline, W / 2, topBarH / 2);

//     // ----- BOTTOM TICKER -----
//     ctx.fillStyle = "#8B0000";
//     ctx.fillRect(0, H - tickerH, W, tickerH);

//     ctx.fillStyle = "#ffffff";
//     ctx.font = `bold ${Math.floor(tickerH * 0.45)}px Arial`;
//     ctx.textAlign = "left";
//     ctx.textBaseline = "middle";

//     const tickerText = (
//       news.marqueeText ||
//       news.ticker ||
//       "BREAKING NEWS"
//     ).toUpperCase();

//     ctx.fillText(tickerText, 20, H - tickerH / 2);

//     // Save overlay image
//     fs.writeFileSync(overlayPath, canvas.toBuffer("image/png"));
//     console.log("Overlay image created");

//     // ========== RUN FFMPEG ==========
//     ffmpeg(videoPath)
//       .input(overlayPath)
// .complexFilter([
//   {
//     filter: "scale",
//     options: {
//       w: W,
//       h: H,
//       force_original_aspect_ratio: "decrease",
//     },
//     inputs: "0:v",
//     outputs: "scaled",
//   },
//   {
//     filter: "pad",
//     options: {
//       w: W,
//       h: H,
//       x: "(ow-iw)/2",
//       y: "(oh-ih)/2",
//       color: "black",
//     },
//     inputs: "scaled",
//     outputs: "base",
//   },
//   {
//     filter: "overlay",
//     options: { x: 0, y: 0 },
//     inputs: ["base", "1:v"],
//     outputs: "out",
//   },
// ])
// .outputOptions([
//   "-map", "[out]",
//   "-map", "0:a?",
//   "-c:v", "libx264",
//   "-preset", "medium",
//   "-crf", "20",
//   "-c:a", "aac",
//   "-b:a", "192k",
//   "-movflags", "+faststart",
//   "-pix_fmt", "yuv420p",
// ])

//       .on("start", cmd => console.log("FFmpeg CMD:", cmd))
//       .on("end", () => {
//         console.log("Video processed successfully");

//         res.download(outputPath, err => {
//           try { fs.unlinkSync(overlayPath); } catch {}
//           try { fs.unlinkSync(outputPath); } catch {}

//           if (err) console.error("Download error:", err);
//         });
//       })
//       .on("error", err => {
//         console.error("FFmpeg ERROR:", err.message);
//         try { fs.unlinkSync(overlayPath); } catch {}
//         try { fs.unlinkSync(outputPath); } catch {}

//         req.flash("error", "Video processing failed");
//         return res.redirect("/admin/main");
//       })
//       .save(outputPath);

//   } catch (err) {
//     console.error("SERVER ERROR:", err);
//     req.flash("error", "Something went wrong");
//     return res.redirect("/admin/main");
//   }
// };


// ... पुराने imports रहने दें

exports.downloadVideoWithOverlay = async (req, res) => {
    try {
        const news = await MainLive.findById(req.params.id);
        if (!news || !news.videoUrl) {
            req.flash("error", "No video found");
            return res.redirect("/admin/main");
        }

        const videoPath = path.join(__dirname, "../../../", news.videoUrl);
        const tempDir = path.join(__dirname, "../../../temp");
        if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

        const outputPath = path.join(tempDir, `ETimes_${Date.now()}.mp4`);

        // फॉन्ट का सही पाथ (सुनिश्चित करें कि यह फ़ाइल आपके सर्वर पर मौजूद है)
        // Linux के लिए: "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf" 
        // या अपना कस्टम फॉन्ट पाथ दें
        const fontPath = "/usr/share/fonts/truetype/freefont/FreeSansBold.ttf"; 

        const headline = news.title || "";
        const tickerText = news.marqueeText || news.ticker || "";

        ffmpeg(videoPath)
            .complexFilter([
                // 1. वीडियो को स्केल करना
                {
                    filter: "scale",
                    options: "1280:720", // एक स्टैंडर्ड साइज सेट करें
                    outputs: "scaled"
                },
                // 2. ऊपर की सफेद पट्टी (Headline Bar)
                {
                    filter: "drawbox",
                    options: { y: 0, color: "white", width: "iw", height: "70", thickness: "fill" },
                    inputs: "scaled",
                    outputs: "topbar"
                },
                // 3. हेडलाइन टेक्स्ट (Hindi)
                {
                    filter: "drawtext",
                    options: {
                        fontfile: fontPath,
                        text: headline,
                        fontcolor: "#680505",
                        fontsize: 36,
                        x: "(w-text_w)/2",
                        y: 15,
                        shadowcolor: "black",
                        shadowx: 1, shadowy: 1
                    },
                    inputs: "topbar",
                    outputs: "withheadline"
                },
                // 4. नीचे की लाल पट्टी (Ticker Bar)
                {
                    filter: "drawbox",
                    options: { y: "ih-60", color: "#8B0000", width: "iw", height: "60", thickness: "fill" },
                    inputs: "withheadline",
                    outputs: "bottombar"
                },
                // 5. टिकर टेक्स्ट (Hindi)
                {
                    filter: "drawtext",
                    options: {
                        fontfile: fontPath,
                        text: tickerText,
                        fontcolor: "white",
                        fontsize: 28,
                        x: 20,
                        y: "h-45"
                    },
                    inputs: "bottombar",
                    outputs: "final"
                }
            ])
            .outputOptions([
                "-map [final]",
                "-map 0:a?",
                "-c:v libx264",
                "-preset fast",
                "-crf 22",
                "-c:a aac",
                "-pix_fmt yuv420p"
            ])
            .on("start", cmd => console.log("FFmpeg CMD:", cmd))
            .on("end", () => {
                res.download(outputPath, () => {
                    try { fs.unlinkSync(outputPath); } catch {}
                });
            })
            .on("error", err => {
                console.error("FFmpeg ERROR:", err.message);
                res.redirect("/admin/main");
            })
            .save(outputPath);

    } catch (err) {
        console.error("SERVER ERROR:", err);
        res.redirect("/admin/main");
    }
};

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
