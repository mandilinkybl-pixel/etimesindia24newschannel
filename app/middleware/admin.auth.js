// middleware/adminAuth.js
const jwt = require("jsonwebtoken");

module.exports = function adminAuth(req, res, next) {
    const token = req.cookies?.adminToken;

    if (!token) {
        return res.redirect("/admin");
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err || !decoded || decoded.role !== "admin") {
            res.clearCookie("adminToken");
            return res.redirect("/admin");
        }

        req.user = decoded;  // ← Use req.user (standard)
        req.user.id = decoded.id;  // optional: make ID easy to access
        next();
    });
};