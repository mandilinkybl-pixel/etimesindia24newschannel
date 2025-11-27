// controllers/admin/mainvideo.js (or adminLiveController.js)
const MainLive = require("../../models/main_video"); // Your model path
const { unlinkSync } = require('fs');
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