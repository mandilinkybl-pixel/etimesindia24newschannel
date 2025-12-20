// controllers/admin/mainvideo.js
const MainLive = require("../../models/main_video")
const { unlinkSync } = require("fs")
const fs = require("fs")
const path = require("path")
const ffmpeg = require("fluent-ffmpeg");
const ffmpegStatic = require("ffmpeg-static");
const ffprobeStatic = require("ffprobe-static");
const os = require("os");
const { createCanvas } = require("canvas");

// --- FIXED PATH LOGIC START ---
let ffmpegPath;
let ffprobePath;

if (os.platform() === "win32") {
    // Windows Development
    ffmpegPath = ffmpegStatic;
    ffprobePath = ffprobeStatic.path;
} else {
    // Linux / Hostinger Production
    // We use the absolute path we confirmed in your terminal via the 'find' command
  // Use these absolute paths verified by your terminal search
const hostingerFFmpeg = "/var/www/etimes/etimesindia24newschannel/node_modules/ffmpeg-static/ffmpeg";
const hostingerFFprobe = "/var/www/etimes/etimesindia24newschannel/node_modules/ffprobe-static/ffprobe";

ffmpeg.setFfmpegPath(hostingerFFmpeg);
ffmpeg.setFfprobePath(hostingerFFprobe);

console.log(`Active FFmpeg Path: ${hostingerFFmpeg}`);
}

ffmpeg.setFfmpegPath(ffmpegPath);
ffmpeg.setFfprobePath(ffprobePath);

console.log(`Active FFmpeg Path: ${ffmpegPath}`);
console.log(`Active FFprobe Path: ${ffprobePath}`);
// --- FIXED PATH LOGIC END ---

// GET: Show edit/create form
exports.getAdminLive = async (req, res) => {
  try {
    const live = await MainLive.findOne()
    res.render("admin/live-edit", {
      live,
      pageTitle: "Edit Main Live Video",
      user: req.user,
      messages: {
        success: req.flash("success")[0],
        error: req.flash("error")[0],
      },
    })
  } catch (err) {
    console.error(err)
    req.flash("error", "Server Error")
    res.redirect("/admin/main")
  }
}

// POST: UPSERT (Create/Update)
exports.postAdminLive = async (req, res) => {
  try {
    const { title, marqueeText, videoUrl, posterUrl, isActive, expiresAt } = req.body

    const videoFile = req.files?.videoFile?.[0]
    const posterFile = req.files?.posterFile?.[0]

    const finalVideoUrl = videoFile ? `/uploads/main/${videoFile.filename}` : videoUrl || ""
    const finalPosterUrl = posterFile ? `/uploads/main/${posterFile.filename}` : posterUrl

    let live = await MainLive.findOne().sort({ createdAt: -1 })

    if (live) {
      live.title = title
      live.marqueeText = marqueeText
      live.videoUrl = finalVideoUrl || live.videoUrl
      live.poster = finalPosterUrl || live.poster
      live.isActive = isActive === "on"
      live.expiresAt = expiresAt ? new Date(expiresAt) : null
      live.views = 0
      live.likes = 0
      live.viewedBy = []
      live.likedBy = []
      live.comments = []
      live.deviceViews = []
      live.deviceLikes = []
      live.deviceComments = []
    } else {
      if (!finalVideoUrl) {
        throw new Error("Video URL or file is required!")
      }
      live = new MainLive({
        title,
        marqueeText,
        videoUrl: finalVideoUrl,
        poster: finalPosterUrl || "https://i.imgur.com/0z8K8pP.jpg",
        isActive: isActive === "on",
        expiresAt: expiresAt ? new Date(expiresAt) : null,
      })
    }

    await live.save()
    req.flash("success", live._id ? "Main Live Video Updated Successfully!" : "Main Live Video Created Successfully!")
    res.redirect("/admin/main")
  } catch (err) {
    console.error(err)
    if (req.files?.videoFile?.[0]) {
      unlinkSync(req.files.videoFile[0].path)
    }
    if (req.files?.posterFile?.[0]) {
      unlinkSync(req.files.posterFile[0].path)
    }
    req.flash("error", err.message || "Failed to save. Check video URL or file.")
    res.redirect("/admin/main")
  }
}

function escapeFFmpegText(text) {
  if (!text) return ""
  return String(text)
    .replace(/\\/g, "\\\\\\\\") // Escape backslashes
    .replace(/'/g, "'\\\\\\''") // Escape single quotes
    .replace(/:/g, "\\:") // Escape colons
    .replace(/\[/g, "\\[") // Escape square brackets
    .replace(/\]/g, "\\]") // Escape square brackets
    .replace(/,/g, "\\,") // Escape commas
    .replace(/;/g, "\\;") // Escape semicolons
    .replace(/\n/g, " ") // Replace newlines with space
    .replace(/\r/g, "") // Remove carriage returns
    .trim()
}

function getFontPath() {
  const platform = os.platform()

  if (platform === "win32") {
    // Windows fonts
    const windowsFonts = ["C:/Windows/Fonts/arialbd.ttf", "C:/Windows/Fonts/arial.ttf", "C:/Windows/Fonts/verdanab.ttf"]
    for (const font of windowsFonts) {
      if (fs.existsSync(font)) return font
    }
    return "arial" // Fallback
  } else {
    // Linux fonts (Hostinger)
    const linuxFonts = [
      "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
      "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf",
      "/usr/share/fonts/truetype/liberation2/LiberationSans-Bold.ttf",
      "/usr/share/fonts/truetype/ubuntu/Ubuntu-B.ttf",
      "/usr/share/fonts/dejavu/DejaVuSans-Bold.ttf",
    ]
    for (const font of linuxFonts) {
      if (fs.existsSync(font)) {
        console.log(`Using font: ${font}`)
        return font
      }
    }
    return "DejaVu-Sans-Bold" // Fallback font name
  }
}

// Main download function with overlay
exports.downloadVideoWithOverlay = async (req, res) => {
  try {
    const news = await MainLive.findById(req.params.id)

    if (!news || !news.videoUrl) {
      req.flash("error", "No video found")
      return res.redirect("/admin/main")
    }

    console.log("Processing video for:", news.title)

    // File paths
    const videoPath = path.join(__dirname, "../../../", news.videoUrl)
    const tempDir = path.join(__dirname, "../../../temp")

    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true })
    }

    // Overlay and output paths
    const overlayPath = path.join(tempDir, `overlay_${news._id}_${Date.now()}.png`)
    const outputPath = path.join(tempDir, `ETimes_${news._id}_${Date.now()}.mp4`)

    const breakingTag = path.join(__dirname, "../../public/logo/tag.png")
    const etimesLogo = path.join(__dirname, "../../public/logo/logo.png")

    if (!fs.existsSync(videoPath)) {
      req.flash("error", "Video file missing on server")
      return res.redirect("/admin/main")
    }

    /* GET VIDEO DIMENSIONS */
    const metadata = await new Promise((resolve, reject) => {
      ffmpeg.ffprobe(videoPath, (err, data) => {
        if (err) reject(err)
        else resolve(data)
      })
    })

    const videoStream = metadata.streams.find((s) => s.codec_type === "video")
    const W = videoStream.width
    const H = videoStream.height
    const fps = eval(videoStream.r_frame_rate) || 30 // Get FPS for smooth animation

    console.log(`Video: ${W}x${H} @ ${fps}fps`)

    /* CREATE OVERLAY CANVAS */
    const canvas = createCanvas(W, H)
    const ctx = canvas.getContext("2d")
    ctx.clearRect(0, 0, W, H)

    const topBarH = Math.floor(H * 0.1) // 10% of height
    const tickerH = Math.floor(H * 0.06) // 6% of height

    // Top white bar
    ctx.fillStyle = "#ffffff"
    ctx.fillRect(0, 0, W, topBarH)

    // Breaking News tag
    if (fs.existsSync(breakingTag)) {
      try {
        const tagImg = await loadImage(breakingTag)
        const tagW = topBarH * 2.5
        const tagH = topBarH * 0.7
        ctx.drawImage(tagImg, 15, (topBarH - tagH) / 2, tagW, tagH)
      } catch (e) {
        console.log("Tag image error:", e.message)
      }
    }

    ctx.fillStyle = "#680505"
    ctx.font = `bold ${Math.floor(topBarH * 0.45)}px Arial`
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"

    const headlineText = (news.title || news.headline || "BREAKING NEWS").toUpperCase()
    const maxHeadlineWidth = W * 0.5 // Use 50% of width for headline

    // Wrap text if too long
    const words = headlineText.split(" ")
    const lines = []
    let currentLine = words[0]

    for (let i = 1; i < words.length; i++) {
      const testLine = currentLine + " " + words[i]
      const metrics = ctx.measureText(testLine)
      if (metrics.width > maxHeadlineWidth && currentLine.length > 0) {
        lines.push(currentLine)
        currentLine = words[i]
      } else {
        currentLine = testLine
      }
    }
    lines.push(currentLine)

    // Draw headline (center, multiple lines if needed)
    const lineHeight = Math.floor(topBarH * 0.5)
    const startY = topBarH / 2 - ((lines.length - 1) * lineHeight) / 2
    lines.forEach((line, idx) => {
      ctx.fillText(line, W / 2, startY + idx * lineHeight)
    })

    // ETimes Logo
    if (fs.existsSync(etimesLogo)) {
      try {
        const logoImg = await loadImage(etimesLogo)
        const logoW = topBarH * 2
        const logoH = topBarH * 0.65
        ctx.drawImage(logoImg, W - logoW - 15, (topBarH - logoH) / 2, logoW, logoH)
      } catch (e) {
        console.log("Logo image error:", e.message)
      }
    }

    // Bottom red ticker bar
    ctx.fillStyle = "#8B0000"
    ctx.fillRect(0, H - tickerH, W, tickerH)

    // Save overlay
    const overlayBuffer = canvas.toBuffer("image/png")
    fs.writeFileSync(overlayPath, overlayBuffer)
    console.log("Overlay created successfully")

    /* PREPARE TICKER TEXT */
    const tickerText = escapeFFmpegText(
      news.marqueeText || news.ticker || `BREAKING NEWS | ${news.title || ""}`,
    ).toUpperCase()

    const fontFile = getFontPath()

    // Calculate scroll speed based on video width for smooth infinite scroll
    const scrollSpeed = Math.floor(W / 8) // Adjust for speed

    /* BUILD FFMPEG FILTER */
    const filterLines = [
      // Scale and pad video
      `[0:v]scale=${W}:${H}:force_original_aspect_ratio=decrease,pad=${W}:${H}:(ow-iw)/2:(oh-ih)/2:black[vid]`,

      // Apply overlay
      `[vid][1:v]overlay=0:0:format=auto[base]`,

      `[base]drawtext=fontfile='${fontFile}':text='%{localtime\\:%H\\\\\\:%M\\\\\\:%S}':fontcolor=red:fontsize=${Math.floor(topBarH * 0.25)}:x=w-tw-15:y=h-${H - topBarH + 5}:box=0[base2]`,

      `[base2]drawtext=fontfile='${fontFile}':text='${tickerText}  ●  ${tickerText}  ●  ${tickerText}':fontcolor=white:fontsize=${Math.floor(tickerH * 0.55)}:x=w-mod(t*${scrollSpeed}\\,w+tw):y=${H - tickerH + Math.floor(tickerH * 0.3)}:shadowcolor=black:shadowx=2:shadowy=2[final]`,
    ]

    const complexFilter = filterLines.join(";")
    console.log("Starting FFmpeg processing...")

    /* RUN FFMPEG */
    ffmpeg(videoPath)
      .input(overlayPath)
      .complexFilter(complexFilter, ["final"])
      .outputOptions([
        "-map",
        "[final]",
        "-map",
        "0:a?",
        "-c:v",
        "libx264",
        "-preset",
        "medium", // Better quality for production
        "-crf",
        "20", // Higher quality
        "-c:a",
        "aac",
        "-b:a",
        "192k", // Better audio quality
        "-movflags",
        "+faststart",
        "-pix_fmt",
        "yuv420p", // Compatibility
      ])
      .on("start", (cmd) => {
        console.log("FFmpeg command:", cmd)
      })
      .on("progress", (progress) => {
        if (progress.percent) {
          console.log(`Processing: ${Math.floor(progress.percent)}%`)
        }
      })
      .on("end", () => {
        console.log("Video processing complete!")

        const downloadFilename = `ETimes_${(news.title || "video").replace(/[^a-z0-9]/gi, "_")}_${Date.now()}.mp4`

        res.download(outputPath, downloadFilename, (err) => {
          // Cleanup temp files
          try {
            fs.unlinkSync(overlayPath)
          } catch (e) {}
          try {
            fs.unlinkSync(outputPath)
          } catch (e) {}

          if (err) {
            console.error("Download error:", err)
          } else {
            console.log("Download complete!")
          }
        })
      })
      .on("error", (err) => {
        console.error("FFmpeg ERROR:", err.message)

        // Cleanup on error
        try {
          fs.unlinkSync(overlayPath)
        } catch (e) {}
        try {
          fs.unlinkSync(outputPath)
        } catch (e) {}

        req.flash("error", "Video processing failed: " + err.message)
        return res.redirect("/admin/main")
      })
      .save(outputPath)
  } catch (err) {
    console.error("SERVER ERROR:", err)
    req.flash("error", "Something went wrong: " + err.message)
    return res.redirect("/admin/main")
  }
}
