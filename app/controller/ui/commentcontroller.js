// app/controllers/ui/videoEngagement.js

const MainLive = require("../../models/main_video");

// Get client IP (works behind proxies too)
const getClientIp = (req) => {
  return (
    req.ip ||
    req.headers["x-forwarded-for"]?.split(",")[0].trim() ||
    req.connection?.remoteAddress ||
    req.socket?.remoteAddress ||
    "unknown"
  );
};

// Detect device type
const getDeviceType = (userAgent) => {
  if (!userAgent) return "unknown";
  const ua = userAgent.toLowerCase();

  if (/tablet|ipad/i.test(ua)) return "tablet";
  if (/mobile|android|iphone|ipod|windows phone/i.test(ua)) return "mobile";
  return "desktop";
};

// 1. Track View - FIXED FOR deviceViews undefined
exports.trackView = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ success: false, message: "ID required" });

    const userAgent = req.get("User-Agent") || "";
    const device = getDeviceType(userAgent);

    const video = await MainLive.findById(id);
    if (!video) return res.status(404).json({ success: false, message: "Video not found" });

    // Increment total views
    video.views += 1;

    // Ensure deviceViews is always an array (safety net)
    if (!Array.isArray(video.deviceViews)) {
      video.deviceViews = [];
    }

    // Find or create device entry
    let deviceStat = video.deviceViews.find((d) => d.device === device);
    if (deviceStat) {
      deviceStat.count += 1;
    } else {
      video.deviceViews.push({ device, count: 1 });
    }

    await video.save();

    res.json({
      success: true,
      views: video.views,
      deviceBreakdown: video.deviceViews,
    });
  } catch (err) {
    console.error("Track View Error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// 2. Toggle Like
exports.toggleLike = async (req, res) => {
  try {
    const { id } = req.params;
    const ip = getClientIp(req);

    const video = await MainLive.findById(id);
    if (!video) return res.status(404).json({ success: false, message: "Video not found" });

    const alreadyLiked = video.likedBy.includes(ip);
    let nowLiked;

    if (alreadyLiked) {
      video.likes -= 1;
      video.likedBy = video.likedBy.filter((x) => x !== ip);
      nowLiked = false;
    } else {
      video.likes += 1;
      video.likedBy.push(ip);
      nowLiked = true;
    }

    await video.save();

    res.json({
      success: true,
      likes: video.likes,
      hasLiked: nowLiked,
    });
  } catch (err) {
    console.error("Toggle Like Error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// 3. Add Comment
exports.addComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, message } = req.body;

    if (!name || !message || name.length > 50 || message.length > 300) {
      return res.status(400).json({ success: false, message: "Invalid input" });
    }

    const video = await MainLive.findById(id);
    if (!video) return res.status(404).json({ success: false, message: "Video not found" });

    video.comments.push({
      name: name.trim(),
      message: message.trim(),
    });

    await video.save();

    const recentComments = video.comments.slice(-10).reverse();

    res.json({
      success: true,
      commentsCount: video.comments.length,
      recentComments,
    });
  } catch (err) {
    console.error("Add Comment Error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// 4. Get Stats (for comment popup refresh)
exports.getStats = async (req, res) => {
  try {
    const { id } = req.params;
    const video = await MainLive.findById(id).select("views likes comments deviceViews");

    if (!video) return res.status(404).json({ success: false, message: "Not found" });

    const recentComments = video.comments.slice(-20).reverse();

    res.json({
      views: video.views || 0,
      likes: video.likes || 0,
      commentsCount: video.comments.length,
      recentComments,
      deviceViews: video.deviceViews || [],
    });
  } catch (err) {
    console.error("Get Stats Error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};