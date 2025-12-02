// generateAndShareVideo.js → SMART CACHING + RED & WHITE CARD + WORKS 100%

const ffmpeg = require("fluent-ffmpeg");
const ffmpegStatic = require("ffmpeg-static");
const { createCanvas, loadImage } = require("canvas");
const path = require("path");
const fs = require("fs");
const os = require("os");
const MainLive = require("../../models/main_video");

ffmpeg.setFfmpegPath(ffmpegStatic);

exports.generateAndShareVideo = async (req, res) => {
  let overlayPath = null;
  let tempVideoPath = null;
  let finalVideoPath = null;

  try {
    const news = await MainLive.findById(req.params.id);
    if (!news || !news.videoUrl) return res.status(404).send("Not found");

    const videoPath = path.resolve(__dirname, "../../../", news.videoUrl.replace(/^\/+/, "")).replace(/\\/g, "/");
    if (!fs.existsSync(videoPath)) return res.status(404).send("Source video missing");

    const publicDir = path.resolve(__dirname, "../../../public/generated");
    if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir, { recursive: true });

    const tempDir = os.tmpdir();
    const safeId = (news._id + "").replace(/[^a-zA-Z0-9]/g, "");
    const filename = `ET_${safeId}.mp4`; // Same name for same news
    finalVideoPath = path.join(publicDir, filename);
    const finalUrl = `${req.protocol}://${req.get("host")}/generated/${filename}`;

    // CHECK IF VIDEO ALREADY EXISTS → INSTANT LOAD!
    if (fs.existsSync(finalVideoPath)) {
      console.log("Already generated → Serving instantly:", finalUrl);
      return sendSuccessPage(res, news, finalUrl);
    }

    // NOT GENERATED YET → GENERATE NOW
    console.log("Generating new video for:", news.title);

    const timestamp = Date.now();
    tempVideoPath = path.join(tempDir, `tmp_${timestamp}.mp4`).replace(/\\/g, "/");

    // Get video size
    const metadata = await new Promise((r, j) => ffmpeg.ffprobe(videoPath, (e, d) => e ? j(e) : r(d)));
    const vs = metadata.streams.find(s => s.codec_type === "video");
    let W = vs.width, H = vs.height;
    if (W > 1280) { const r = 1280 / W; W = 1280; H = Math.round(H * r); }

    // FULL CANVAS OVERLAY
    const canvas = createCanvas(W, H);
    const ctx = canvas.getContext("2d");
    const topH = Math.floor(H * 0.09);
    const tickerH = Math.floor(H * 0.06);

    ctx.fillStyle = "#ffffff"; ctx.fillRect(0, 0, W, topH);
    ctx.fillStyle = "#a00000"; ctx.fillRect(0, H - tickerH, W, tickerH);

    // Logos
    try {
      const tag = await loadImage(path.resolve("public/logo/tag.png"));
      const logo = await loadImage(path.resolve("public/logo/logo.png"));
      ctx.drawImage(tag, 15, topH * 0.15, topH * 1.8, topH * 0.7);
      ctx.drawImage(logo, W - topH * 2, topH * 0.2, topH * 1.6, topH * 0.6);
    } catch (e) {}

    // Headline
    ctx.fillStyle = "#a00000";
    ctx.font = `bold ${Math.floor(topH * 0.55)}px Arial`;
    ctx.textAlign = "left";
    ctx.fillText((news.title || "LIVE NEWS").toUpperCase().substring(0, 70), topH * 2.5, topH * 0.68);

    // Ticker
    ctx.fillStyle = "white";
    ctx.font = `bold ${Math.floor(tickerH * 0.65)}px Arial`;
    const tickerText = (news.marqueeText || "E TIMES INDIA LIVE • BREAKING NEWS").toUpperCase();
    const fullTicker = tickerText + "      •      " + tickerText + "      •      " + tickerText;
    ctx.fillText(fullTicker, 20, H - tickerH * 0.3);

    overlayPath = path.join(tempDir, `ov_${timestamp}.png`).replace(/\\/g, "/");
    fs.writeFileSync(overlayPath, canvas.toBuffer("image/png"));

    // ONLY LIVE CLOCK (safe for old ffmpeg)
    const filter = [
      `[0:v]scale=${W}:${H}:force_original_aspect_ratio=decrease,pad=${W}:${H}:(ow-iw)/2:(oh-ih)/2:black[v]`,
      `[v][1:v]overlay=0:0[v1]`,
      `[v1]drawtext=fontfile=Arial:text='%{%H\\\\:%M\\\\:%S}':fontcolor=white:fontsize=20:x=w-tw-15:y=12:box=1:boxcolor=black@0.6:boxborderw=8[outv]`
    ];

    await new Promise((resolve, reject) => {
      ffmpeg()
        .input(videoPath)
        .input(overlayPath)
        .complexFilter(filter.join(";"))
        .outputOptions([
          "-map", "[outv]",
          "-map", "0:a?",
          "-c:v", "libx264",
          "-preset", "veryfast",
          "-crf", "23",
          "-pix_fmt", "yuv420p",
          "-c:a", "aac",
          "-b:a", "128k"
        ])
        .output(tempVideoPath)
        .on("end", () => {
          fs.renameSync(tempVideoPath, finalVideoPath);
          console.log("NEW VIDEO SAVED →", finalUrl);
          resolve();
        })
        .on("error", reject)
        .run();
    });

    [overlayPath, tempVideoPath].forEach(f => f && fs.existsSync(f) && fs.unlinkSync(f));

    // SEND SUCCESS PAGE
    sendSuccessPage(res, news, finalUrl);

  } catch (err) {
    console.error("ERROR:", err.message);
    [overlayPath, tempVideoPath, finalVideoPath].forEach(f => f && fs.existsSync(f) && fs.unlinkSync(f));
    res.status(500).send("<h1 style='color:red;text-align:center;padding:100px'>Failed — <button onclick='location.reload()' style='padding:15px 30px;background:#f00;color:#fff;border:none;border-radius:50px;cursor:pointer'>Try Again</button></h1>");
  }
};

// REUSABLE SUCCESS PAGE FUNCTION
function sendSuccessPage(res, news, finalUrl) {
  const title = (news.title || "Breaking News").toUpperCase();
  const shareText = encodeURIComponent(`${title}\n\nWatch Now → ${finalUrl}\n\nE Times India Live`);

  res.send(`
<!DOCTYPE html>
<html lang="hi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>E Times India • Video Ready</title>
  <link rel="icon" href="/logo/logo.png">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@700&display=swap');
    body {margin:0;padding:20px;background:linear-gradient(135deg,#000,#1a0000);font-family:'Roboto',Arial;color:#fff;min-height:100vh;display:flex;justify-content:center;align-items:center;}
    .card {width:90%;max-width:420px;background:#fff;color:#000;border-radius:20px;overflow:hidden;box-shadow:0 20px 40px rgba(255,0,0,0.6);border:6px solid #c00;}
    .header {background:#c00;color:#fff;padding:15px;text-align:center;font-size:22px;font-weight:bold;position:relative;}
    .header img {height:50px;position:absolute;left:15px;top:10px;border-radius:8px;}
    .video-container {background:#000;padding:10px;}
    video {width:100%;border-radius:12px;}
    .content {padding:20px;text-align:center;}
    .title {font-size:18px;font-weight:bold;color:#c00;margin:10px 0;}
    .share-title {font-size:20px;color:#c00;margin:15px 0 10px;font-weight:bold;}
    .btn {display:inline-block;padding:14px 24px;margin:8px;border-radius:50px;font-weight:bold;font-size:17px;text-decoration:none;color:#fff;min-width:140px;transition:0.3s;box-shadow:0 4px 15px rgba(0,0,0,0.3);}
    .wa {background:#25D366;}
    .fb {background:#1877F2;}
    .x {background:#000;border:3px solid #1DA1F2;color:#1DA1F2;}
    .tg {background:#0088cc;}
    .copy {background:#ff4444;}
    .download {background:#c00;}
    .btn:hover {transform:scale(1.08);}
    .footer {background:#c00;color:#fff;padding:12px;font-size:14px;}
  </style>
</head>
<body>
<div class="card">
  <div class="header">
    <img src="/logo/logo.png" alt="E Times India">
    VIDEO READY TO GO VIRAL!
  </div>
  <div class="video-container">
    <video controls poster="/logo/logo.png">
      <source src="${finalUrl}" type="video/mp4">
    </video>
  </div>
  <div class="content">
    <div class="title">${title.substring(0, 80)}</div>
    <div class="share-title">SHARE NOW</div>
    <a href="https://wa.me/?text=${shareText}" class="btn wa">WhatsApp</a>
    <a href="https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(finalUrl)}" target="_blank" class="btn fb">Facebook</a>
    <a href="https://twitter.com/intent/tweet?url=${encodeURIComponent(finalUrl)}&text=${encodeURIComponent(title + " | E Times India")}" target="_blank" class="btn x">X</a>
    <a href="https://t.me/share/url?url=${encodeURIComponent(finalUrl)}&text=${encodeURIComponent(title)}" target="_blank" class="btn tg">Telegram</a>
    <button onclick="navigator.clipboard.writeText('${finalUrl}');alert('Link Copied!')" class="btn copy">Copy Link</button>
    <a href="${finalUrl}" download class="btn download">Download</a>
  </div>
  <div class="footer">
    Powered by <strong>E Times India</strong> • Live • Breaking • Trusted
  </div>
</div>
<script>
  if(/Android|iPhone|iPad/i.test(navigator.userAgent)) {
    setTimeout(() => window.location.href = "https://wa.me/?text=${shareText}", 2000);
  }
</script>
</body>
</html>
  `);
}