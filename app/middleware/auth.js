const jwt = require("jsonwebtoken");
const User = require("../../app/models/user");

exports.protect = async (req, res, next) => {
  let token;

  if (req.cookies.token) {
    token = req.cookies.token;
  }

  // For public routes like home, we don't redirect - just set user to null and proceed
  // But this middleware is meant for PROTECTED routes only.
  // Apply it ONLY to routes that require auth (e.g., /admin).
  // For home (/), do NOT apply this middleware at all.

  if (!token) {
    req.user = null;  // Set to null for public access
    return next();    // Proceed without redirect
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    
    if (!user) {
      req.user = null;
      return next();  // Proceed as unauthenticated
    }
    
    req.user = user;
    next();
  } catch (err) {
    req.user = null;
    return next();  // Proceed as unauthenticated on error
  }
};

exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.redirect("/");  // Keep redirect for unauthorized on protected routes
    }
    next();
  };
};