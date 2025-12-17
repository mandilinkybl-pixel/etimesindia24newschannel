// app/controllers/ui/videoEngagement.js

const MainLive = require("../../models/main_video");

// Get client IP with localhost normalization
const getClientIp = (req) => {
  let ip =
    req.ip ||
    req.headers["x-forwarded-for"]?.split(",")[0].trim() ||
    req.connection?.remoteAddress ||
    req.socket?.remoteAddress ||
    "unknown";

  // Normalize all localhost variations to a single value for consistent testing
  if (
    ip === "::1" ||
    ip === "127.0.0.1" ||
    ip === "::ffff:127.0.0.1" ||
    ip.startsWith("::ffff:127.") // Safety for other local variants
  ) {
    ip = "localhost";
  }

  return ip;
};

// Detect device type
const getDeviceType = (userAgent) => {
  if (!userAgent) return "unknown";
  const ua = userAgent.toLowerCase();

  if (/tablet|ipad/i.test(ua)) return "tablet";
  if (/mobile|android|iphone|ipod|windows phone/i.test(ua)) return "mobile";
  return "desktop";
};

// Helper to update device count array
const updateDeviceCount = (deviceArray, device, increment = 1) => {
  let stat = deviceArray.find((d) => d.device === device);
  if (stat) {
    stat.count += increment;
    if (stat.count < 0) stat.count = 0; // Safety
  } else {
    deviceArray.push({ device, count: Math.max(1, increment) });
  }
};

// 1. Track View - Unique per IP forever
exports.trackView = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ success: false, message: "ID required" });

    const ip = getClientIp(req);
    const userAgent = req.get("User-Agent") || "";
    const device = getDeviceType(userAgent);

    const video = await MainLive.findById(id);
    if (!video) return res.status(404).json({ success: false, message: "Video not found" });

    // Initialize arrays if missing
    if (!Array.isArray(video.viewedBy)) video.viewedBy = [];
    if (!Array.isArray(video.deviceViews)) video.deviceViews = [];

    // Check if this IP already viewed
    const alreadyViewed = video.viewedBy.some((entry) => entry.ip === ip);
    let isNewView = false;

    if (!alreadyViewed) {
      video.viewedBy.push({ ip, device });
      video.views += 1;
      isNewView = true;

      updateDeviceCount(video.deviceViews, device, 1);
      await video.save();
    }

    res.json({
      success: true,
      views: video.views,
      isNewView, // Useful for frontend animation
      deviceBreakdown: video.deviceViews,
    });
  } catch (err) {
    console.error("Track View Error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// 2. Toggle Like - Unique per IP
exports.toggleLike = async (req, res) => {
  try {
    const { id } = req.params;
    const ip = getClientIp(req);
    const userAgent = req.get("User-Agent") || "";
    const device = getDeviceType(userAgent);

    const video = await MainLive.findById(id);
    if (!video) return res.status(404).json({ success: false, message: "Video not found" });

    if (!Array.isArray(video.likedBy)) video.likedBy = [];
    if (!Array.isArray(video.deviceLikes)) video.deviceLikes = [];

    const likeIndex = video.likedBy.findIndex((entry) => entry.ip === ip);
    let nowLiked;

    if (likeIndex !== -1) {
      // Unlike
      const removedDevice = video.likedBy[likeIndex].device;
      video.likedBy.splice(likeIndex, 1);
      video.likes -= 1;
      updateDeviceCount(video.deviceLikes, removedDevice, -1);
      nowLiked = false;
    } else {
      // Like
      video.likedBy.push({ ip, device });
      video.likes += 1;
      updateDeviceCount(video.deviceLikes, device, 1);
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

// 3. Add Comment - Anonymous, multiple allowed per IP
exports.addComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { message } = req.body;

    if (!message || message.trim().length === 0 || message.length > 300) {
      return res.status(400).json({ success: false, message: "Message is required and max 300 chars" });
    }

    const ip = getClientIp(req);
    const userAgent = req.get("User-Agent") || "";
    const device = getDeviceType(userAgent);

    const video = await MainLive.findById(id);
    if (!video) return res.status(404).json({ success: false, message: "Video not found" });

    if (!Array.isArray(video.comments)) video.comments = [];
    if (!Array.isArray(video.deviceComments)) video.deviceComments = [];

    video.comments.push({
      name: "Anonymous",
      message: message.trim(),
      ip,
      device,
    });

    updateDeviceCount(video.deviceComments, device, 1);

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

// 4. Get Stats - For live updates in frontend
exports.getStats = async (req, res) => {
  try {
    const { id } = req.params;

    const video = await MainLive.findById(id).select(
      "views likes comments deviceViews deviceLikes deviceComments"
    );

    if (!video) return res.status(404).json({ success: false, message: "Not found" });

    const recentComments = video.comments.slice(-20).reverse();

    res.json({
      views: video.views || 0,
      likes: video.likes || 0,
      commentsCount: video.comments.length,
      recentComments,
      deviceViews: video.deviceViews || [],
      deviceLikes: video.deviceLikes || [],
      deviceComments: video.deviceComments || [],
    });
  } catch (err) {
    console.error("Get Stats Error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};