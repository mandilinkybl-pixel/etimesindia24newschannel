
// generateAndShareVideo.js → FULLY FIXED & UPDATED FOR DECEMBER 16, 2025
// Route: GET /share/:id (or /generate/:id — rename if needed)
// Adds: ffprobe path fix, dynamic headline from DB, engagement integration

const ffmpeg = require("fluent-ffmpeg");
const ffmpegStatic = require("ffmpeg-static");
const ffprobeStatic = require("ffprobe-static");
const { createCanvas, loadImage } = require("canvas");
const path = require("path");
const fs = require("fs");
const os = require("os");
const MainLive = require("../../models/main_video"); // Updated model name

// FIX: Set both ffmpeg and ffprobe paths
ffmpeg.setFfmpegPath(ffmpegStatic.path);
ffmpeg.setFfprobePath(ffprobeStatic.path);

exports.generateAndShareVideo = async (req, res) => {
  let overlayPath = null;
  let tempVideoPath = null;
  let finalVideoPath = null;

  try {
    const news = await MainLive.findById(req.params.id);
    if (!news || !news.videoUrl) return res.status(404).send("Not found");

    // Increment views on share page load (device-wise already handled in /api/video/:id/view)
    // Optional: You can call trackView here if not called on main page

    const videoPath = path.resolve(__dirname, "../../../", news.videoUrl.replace(/^\/+/, "")).replace(/\\/g, "/");
    if (!fs.existsSync(videoPath)) return res.status(404).send("Source video missing");

    const publicDir = path.resolve(__dirname, "../../../public/generated");
    if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir, { recursive: true });

    const tempDir = os.tmpdir();
    const safeId = (news._id + "").replace(/[^a-zA-Z0-9]/g, "");
    const filename = `ET_${safeId}.mp4`;
    finalVideoPath = path.join(publicDir, filename);
    const finalUrl = `https://www.etimesindia24.com/generated/${filename}`;

    // SMART CACHING: Serve instantly if already generated
    if (fs.existsSync(finalVideoPath)) {
      console.log("Serving cached video:", finalUrl);
      return sendSuccessPage(res, news, finalUrl);
    }

    console.log("Generating new 10-second branded clip for:", news.title);

    const timestamp = Date.now();
    tempVideoPath = path.join(tempDir, `tmp_${timestamp}.mp4`).replace(/\\/g, "/");

    // Get video metadata
    const metadata = await new Promise((resolve, reject) => {
      ffmpeg.ffprobe(videoPath, (err, data) => err ? reject(err) : resolve(data));
    });
    const vs = metadata.streams.find(s => s.codec_type === "video");
    let W = vs.width, H = vs.height;
    if (W > 1280) { const r = 1280 / W; W = 1280; H = Math.round(H * r); }

    // Canvas overlay
    const canvas = createCanvas(W, H);
    const ctx = canvas.getContext("2d");
    const topH = Math.floor(H * 0.09);
    const tickerH = Math.floor(H * 0.06);

    ctx.fillStyle = "#ffffff"; ctx.fillRect(0, 0, W, topH);
    ctx.fillStyle = "#a00000"; ctx.fillRect(0, H - tickerH, W, tickerH);

    // Logos
    try {
      const tag = await loadImage(path.resolve(__dirname, "../../../public/logo/tag.png"));
      const logo = await loadImage(path.resolve(__dirname, "../../../public/logo/logo.png"));
      ctx.drawImage(tag, 15, topH * 0.15, topH * 1.8, topH * 0.7);
      ctx.drawImage(logo, W - topH * 2, topH * 0.2, topH * 1.6, topH * 0.6);
    } catch (e) { console.log("Logo load error:", e); }

    // DYNAMIC HEADLINE FROM DATABASE (fallback to current real news)
    let headline = (news.title || "").toUpperCase().trim();
    if (!headline || headline.length < 10) {
      headline = "PM MODI IN JORDAN: INDIA'S GROWTH ABOVE 8% - NEW OPPORTUNITIES FOR INVESTORS";
    }

    // Top bar headline
    ctx.fillStyle = "#a00000";
    ctx.font = `bold ${Math.floor(topH * 0.55)}px Arial`;
    ctx.textAlign = "left";
    ctx.fillText(headline.substring(0, 70) + (headline.length > 70 ? "..." : ""), topH * 2.5, topH * 0.68);

    // Bottom ticker
    ctx.fillStyle = "white";
    ctx.font = `bold ${Math.floor(tickerH * 0.65)}px Arial`;
    const tickerText = (news.marqueeText || "E TIMES INDIA 24 • BREAKING NEWS • LIVE UPDATES").toUpperCase();
    const fullTicker = tickerText + "      •      " + tickerText + "      •      " + tickerText;
    ctx.fillText(fullTicker, 20, H - tickerH * 0.3);

    overlayPath = path.join(tempDir, `ov_${timestamp}.png`).replace(/\\/g, "/");
    fs.writeFileSync(overlayPath, canvas.toBuffer("image/png"));

    // Live clock filter
    const filter = [
      `[0:v]scale=${W}:${H}:force_original_aspect_ratio=decrease,pad=${W}:${H}:(ow-iw)/2:(oh-ih)/2:black[v]`,
      `[v][1:v]overlay=0:0[v1]`,
      `[v1]drawtext=fontfile=Arial:text='%{%H\\\\:%M\\\\:%S}':fontcolor=white:fontsize=20:x=w-tw-15:y=12:box=1:boxcolor=black@0.6:boxborderw=8[outv]`
    ];

    // Generate 10-second clip
    await new Promise((resolve, reject) => {
      ffmpeg()
        .input(videoPath)
        .inputOptions(['-t 10']) // 10-second clip
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
          console.log("Branded clip ready →", finalUrl);
          resolve();
        })
        .on("error", reject)
        .run();
    });

    // Cleanup temp files
    [overlayPath, tempVideoPath].forEach(f => f && fs.existsSync(f) && fs.unlinkSync(f));

    sendSuccessPage(res, news, finalUrl);

  } catch (err) {
    console.error("Generation ERROR:", err);
    [overlayPath, tempVideoPath, finalVideoPath].forEach(f => f && fs.existsSync(f) && fs.unlinkSync(f));
    res.status(500).send(`
      <h1 style="color:red;text-align:center;padding:100px">
        Generation Failed!<br>
        <button onclick="location.reload()" style="padding:15px 30px;background:#f00;color:#fff;border:none;border-radius:50px;cursor:pointer;margin-top:20px;">
          Try Again
        </button>
      </h1>
    `);
  }
};

// SUCCESS SHARE PAGE WITH ENGAGEMENT BAR
function sendSuccessPage(res, news, finalUrl) {
  const title = (news.title || "PM MODI IN JORDAN: INDIA'S GROWTH ABOVE 8%").toUpperCase();
  const shareText = encodeURIComponent(`${title}\n\nWatch Viral 10-Second Clip → ${finalUrl}\n\nE Times India 24 • Live • Breaking • Trusted`);

  const videoId = news._id;

  res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} | E Times India 24</title>
  <link rel="icon" href="https://www.etimesindia24.com/logo/logo.png">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@700&display=swap');
    body {margin:0;padding:20px;background:linear-gradient(135deg,#000,#1a0000);font-family:'Roboto',sans-serif;color:#fff;display:flex;justify-content:center;align-items:center;min-height:100vh;}
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
    .engagement-bar {background:#fff;padding:12px 15px;display:flex;justify-content:space-between;align-items:center;border-top:3px solid #a00000;}
    .engagement-bar div {display:flex;gap:20px;align-items:center;}
  </style>
</head>
<body>
<div class="card">
  <div class="header">
    <img src="https://www.etimesindia24.com/logo/logo.png" alt="Logo">
    VIRAL CLIP READY!
  </div>
  <div class="video-container">
    <video controls poster="https://www.etimesindia24.com/logo/logo.png" id="shareVideo">
      <source src="${finalUrl}" type="video/mp4">
    </video>
  </div>
  <div class="content">
    <div class="title">${title.substring(0, 80)}</div>
    <div class="share-title">SHARE NOW</div>
    <a href="https://wa.me/?text=${shareText}" class="btn wa">WhatsApp</a>
    <a href="https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(finalUrl)}" target="_blank" class="btn fb">Facebook</a>
    <a href="https://twitter.com/intent/tweet?url=${encodeURIComponent(finalUrl)}&text=${encodeURIComponent(title + " | E Times India 24")}" target="_blank" class="btn x">X</a>
    <a href="https://t.me/share/url?url=${encodeURIComponent(finalUrl)}&text=${encodeURIComponent(title)}" target="_blank" class="btn tg">Telegram</a>
    <button onclick="navigator.clipboard.writeText('${finalUrl}');alert('Link Copied!')" class="btn copy">Copy Link</button>
    <a href="${finalUrl}" download class="btn download">Download</a>
  </div>

  <!-- ENGAGEMENT BAR -->
  <div class="engagement-bar">
    <div>
      <span style="font-size:20px;">👁️</span> <span id="viewCount">${news.views || 0}</span> Views
      &nbsp;&nbsp;
      <span onclick="toggleLike()" style="cursor:pointer;">
        <span id="likeIcon" style="font-size:24px;">${news.likes > 0 ? '❤️' : '🤍'}</span>
        <span id="likeCount">${news.likes || 0}</span>
      </span>
    </div>
    <div>
      <span onclick="openCommentPopup()" style="cursor:pointer;font-size:22px;">💬 <span id="commentCount">${news.comments?.length || 0}</span></span>
    </div>
  </div>

  <div class="footer">
    Powered by <strong>E Times India 24</strong> • Live • Breaking • Trusted
  </div>
</div>

<!-- Comment Modal & Scripts -->
<script>
  const videoId = "${videoId}";

  // Track view when video plays (more accurate than page load)
  document.getElementById("shareVideo").addEventListener("play", () => {
    fetch(\`/api/video/\${videoId}/view\`, { method: "POST" })
      .then(r => r.json())
      .then(data => {
        document.getElementById("viewCount").textContent = data.views;
      });
  });

  async function toggleLike() {
    const res = await fetch(\`/api/video/\${videoId}/like\`, { method: "POST" });
    const data = await res.json();
    if (data.success) {
      document.getElementById("likeCount").textContent = data.likes;
      document.getElementById("likeIcon").textContent = data.hasLiked ? "❤️" : "🤍";
    }
  }

  // Comment popup logic (same as before — add full modal if needed)
  function openCommentPopup() {
    alert("Comment feature coming soon!"); // Replace with full modal
  }

  // Auto redirect to WhatsApp on mobile after 2 seconds
  if(/Android|iPhone|iPad/i.test(navigator.userAgent)) {
    setTimeout(() => window.location.href = "https://wa.me/?text=${shareText}", 2000);
  }
</script>
</body>
</html>
  `);
}
