const User = require("../../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

class adminAuth{

    // ---------------------------
    // ADMIN SIGNUP API
    // ---------------------------
    adminSignup= async (req, res) => {
        try {
            const { username, email, phone, password } = req.body;
            console.log(req.body)

            if (!username || !email || !phone || !password) {
                return res.status(400).json({ message: "All fields are required" });
            }

            const exists = await User.findOne({ email });
            if (exists) {
                return res.status(400).json({ message: "Email already exists" });
            }

            const hashed = await bcrypt.hash(password, 10);

            const admin = await User.create({
                username,
                email,
                phone,
                password: hashed,
                role: "admin",
                status: "active",
            });

            res.status(201).json({
                message: "Admin created successfully",
                admin,
            });

        } catch (err) {
            console.log(err);
            res.status(500).json({ message: "Server Error" });
        }
    }

    // ---------------------------
    // ADMIN LOGIN
    // ---------------------------
    adminLogin= async (req, res) => {
        try {
            const { email, password } = req.body;

            const admin = await User.findOne({ email, role: "admin" });
            if (!admin) {
                return res.status(404).json({ message: "Admin not found" });
            }

            const match = await bcrypt.compare(password, admin.password);
            if (!match) {
                return res.status(400).json({ message: "Invalid password" });
            }

            // JWT Token
            const token = jwt.sign(
                { id: admin._id, role: admin.role },
                process.env.JWT_SECRET,
                { expiresIn: "7d" }
            );

            // Save token in cookie
            res.cookie("adminToken", token, {
                httpOnly: true,
                secure: false,
                maxAge: 7 * 24 * 60 * 60 * 1000
            });

            res.redirect("/admin/dashboard")

        } catch (err) {
            console.log(err);
            res.redirect("/admin/")
        }
    }

    // ---------------------------
    // FORGOT PASSWORD (Send OTP)
    // ---------------------------
    forgotPassword= async (req, res) => {
        try {
            const { email } = req.body;

            const admin = await User.findOne({ email, role: "admin" });
            if (!admin) {
                return res.status(404).json({ message: "Admin not found" });
            }

            const otp = Math.floor(100000 + Math.random() * 900000);
            admin.resetOtp = otp;
            admin.otpExpire = Date.now() + 10 * 60 * 1000;
            await admin.save();

            console.log("OTP:", otp);

            res.json({ message: "OTP sent", otp }); // testing purpose only

        } catch (err) {
            console.log(err);
            res.status(500).json({ message: "Server Error" });
        }
    }

    // ---------------------------
    // VERIFY OTP
    // ---------------------------
    verifyOtp= async (req, res) => {
        try {
            const { email, otp } = req.body;

            const admin = await User.findOne({ email, role: "admin" });
            if (!admin) {
                return res.status(404).json({ message: "Admin not found" });
            }

            if (admin.resetOtp != otp || admin.otpExpire < Date.now()) {
                return res.status(400).json({ message: "Invalid or expired OTP" });
            }

            res.json({ message: "OTP Verified" });

        } catch (err) {
            console.log(err);
            res.status(500).json({ message: "Server Error" });
        }
    }

    // ---------------------------
    // RESET PASSWORD
    // ---------------------------
    resetPassword= async (req, res) => {
        try {
            const { email, newPassword } = req.body;

            const admin = await User.findOne({ email, role: "admin" });
            if (!admin) {
                return res.status(404).json({ message: "Admin not found" });
            }

            admin.password = await bcrypt.hash(newPassword, 10);
            admin.resetOtp = null;
            admin.otpExpire = null;
            await admin.save();

            res.json({ message: "Password reset successful" });

        } catch (err) {
            console.log(err);
            res.status(500).json({ message: "Server Error" });
        }
    }

    // ---------------------------
    // LOGOUT
    // ---------------------------
    logout= async (req, res) => {
        res.clearCookie("adminToken");
        res.json({ message: "Logged out successfully" });
    }

};
module.exports = new adminAuth()