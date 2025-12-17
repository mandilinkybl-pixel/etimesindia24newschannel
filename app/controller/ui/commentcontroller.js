// app/controllers/ui/videoEngagement.js
const MainLive = require("../../models/main_video");

// Best real IP detection (works behind Nginx/Cloudflare too)
const getClientIp = (req) => {
  return (
    req.headers["x-real-ip"] ||
    req.headers["x-forwarded-for"]?.split(",")[0].trim() ||
    req.ip ||
    req.connection?.remoteAddress ||
    req.socket?.remoteAddress ||
    "unknown"
  ).replace(/^::ffff:/, ""); // Clean IPv6 wrapper
};

// Accurate device detection
const getDeviceType = (userAgent) => {
  if (!userAgent) return "unknown";
  const ua = userAgent.toLowerCase();
  if (/tablet|ipad|playbook|silk/i.test(ua)) return "tablet";
  if (/mobile|iphone|ipod|android|blackberry|opera mini|iemobile/i.test(ua)) return "mobile";
  return "desktop";
};

const updateDeviceCount = (array, device, inc = 1) => {
  let entry = array.find(d => d.device === device);
  if (entry) {
    entry.count += inc;
    if (entry.count < 0) entry.count = 0;
  } else {
    array.push({ device, count: Math.max(1, inc) });
  }
};

// Track View - 1 per IP + Device
exports.trackView = async (req, res) => {
  try {
    const { id } = req.params;
    const ip = getClientIp(req);
    const device = getDeviceType(req.get("User-Agent"));

    const video = await MainLive.findById(id);
    if (!video) return res.status(404).json({ success: false });

    if (!video.viewedBy) video.viewedBy = [];
    if (!video.deviceViews) video.deviceViews = [];

    const alreadyViewed = video.viewedBy.some(v => v.ip === ip && v.device === device);

    let isNewView = false;
    if (!alreadyViewed) {
      video.viewedBy.push({ ip, device });
      video.views += 1;
      isNewView = true;
      updateDeviceCount(video.deviceViews, device, 1);
      await video.save();
    }

    res.json({ success: true, views: video.views, isNewView, deviceBreakdown: video.deviceViews });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
};

// Toggle Like - 1 per IP + Device
exports.toggleLike = async (req, res) => {
  try {
    const { id } = req.params;
    const ip = getClientIp(req);
    const device = getDeviceType(req.get("User-Agent"));

    const video = await MainLive.findById(id);
    if (!video) return res.status(404).json({ success: false });

    if (!video.likedBy) video.likedBy = [];
    if (!video.deviceLikes) video.deviceLikes = [];

    const index = video.likedBy.findIndex(l => l.ip === ip && l.device === device);
    let hasLiked;

    if (index > -1) {
      // Unlike
      updateDeviceCount(video.deviceLikes, video.likedBy[index].device, -1);
      video.likedBy.splice(index, 1);
      video.likes -= 1;
      hasLiked = false;
    } else {
      // Like
      video.likedBy.push({ ip, device });
      video.likes += 1;
      updateDeviceCount(video.deviceLikes, device, 1);
      hasLiked = true;
    }

    await video.save();

    res.json({ success: true, likes: video.likes, hasLiked });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
};

// Add Comment
exports.addComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { message } = req.body;
    if (!message || message.trim().length > 300) return res.status(400).json({ success: false });

    const ip = getClientIp(req);
    const device = getDeviceType(req.get("User-Agent"));

    const video = await MainLive.findById(id);
    if (!video) return res.status(404).json({ success: false });

    if (!video.comments) video.comments = [];
    if (!video.deviceComments) video.deviceComments = [];

    video.comments.push({
      name: "Anonymous",
      message: message.trim(),
      ip,
      device
    });

    updateDeviceCount(video.deviceComments, device, 1);
    await video.save();

    const recentComments = video.comments.slice(-10).reverse();

    res.json({ success: true, commentsCount: video.comments.length, recentComments });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
};

// Get Stats
exports.getStats = async (req, res) => {
  try {
    const { id } = req.params;
    const video = await MainLive.findById(id).select("views likes comments deviceViews deviceLikes deviceComments");
    if (!video) return res.status(404).json({ success: false });

    const recentComments = video.comments.slice(-20).reverse();

    res.json({
      views: video.views || 0,
      likes: video.likes || 0,
      commentsCount: video.comments.length,
      recentComments,
      deviceViews: video.deviceViews || [],
      deviceLikes: video.deviceLikes || [],
      deviceComments: video.deviceComments || []
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
};