const User = require("../../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const sendEmail = require("../../utils/sendEmail");
const logoImage = "/logo/logo2.jpeg"
const generateOtp = () => Math.floor(100000 + Math.random() * 900000);

// JWT token utility (used for login only)
const sendTokenResponse = (user, statusCode, res) => {
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });

  const options = {
    expires: new Date(Date.now() + process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  };

  res.status(statusCode).cookie("token", token, options).json({
    success: true,
    token,
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
      phone: user.phone,
      role: user.role,
    },
  });
};

// @desc    Send OTP for Signup
// @route   POST /api/auth/send-otp
exports.sendSignupOtp = async (req, res) => {
  const { name, email, phone, password } = req.body;

  if (!name || !email || !phone || !password) {
    return res.status(400).json({ success: false, message: "All fields are required" });
  }
  if (password.length < 6) {
    return res.status(400).json({ success: false, message: "Password must be at least 6 characters" });
  }

  const emailExists = await User.findOne({ email });
  if (emailExists) {
    return res.status(400).json({ success: false, message: "Email already registered" });
  }

  const phoneExists = await User.findOne({ phone });
  if (phoneExists) {
    return res.status(400).json({ success: false, message: "Phone number already registered" });
  }

  const otp = generateOtp();
  const otpExpiry = Date.now() + 10 * 60 * 1000; // 10 minutes

  // Store OTP and user details in a temporary location (please use a DB/cache in production!)
  req.app.locals.tempUser = { name, email, phone, password, otp, otpExpiry };

  try {
   await sendEmail({
  email,
  subject: "E TIMES INDIA 24 – Your Secure OTP",
  html: `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
      <title>E TIMES INDIA 24 - OTP Verification</title>
    </head>
    <body style="margin:0; padding:0; background:#f8f8f8; font-family:'Arial', sans-serif;">
      <center style="width:100%; background:#f8f8f8; padding:30px 10px;">
        <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="max-width:600px; margin:0 auto; background:#ffffff; border-radius:18px; overflow:hidden; box-shadow:0 15px 40px rgba(220,38,38,0.15); border:4px solid #dc2626;">
          
          <!-- RED HEADER WITH LOGO -->
          <tr>
            <td style="background:#dc2626; padding:35px 20px; text-align:center;">
              <img 
                src="${logoImage}" 
                alt="E TIMES INDIA 24" 
                width="220" 
                style="display:block; margin:0 auto 18px; border-radius:12px; border:3px solid white;"
              />
              <h1 style="color:white; margin:0; font-size:36px; font-weight:900; letter-spacing:2px; text-shadow:0 3px 6px rgba(0,0,0,0.4);">
                E TIMES INDIA 24
              </h1>
              <p style="color:#ffe4e4; margin:10px 0 0; font-size:17px; font-weight:600;">
                Breaking News • Live Updates • 24×7
              </p>
            </td>
          </tr>

          <!-- MAIN CONTENT -->
          <tr>
            <td style="padding:50px 40px; text-align:center; background:#ffffff;">
              <h2 style="color:#dc2626; font-size:30px; margin:0 0 25px; font-weight:800;">
                Account Verification
              </h2>
              <p style="color:#444444; font-size:18px; line-height:1.7; margin:0 0 40px;">
                Welcome to <strong style="color:#dc2626;">E TIMES INDIA 24</strong><br>
                Use the OTP below to complete your secure registration.
              </p>

              <!-- RED & WHITE OTP CARD -->
              <div style="background:#dc2626; border-radius:20px; padding:40px 20px; margin:40px auto; max-width:380px; box-shadow:0 12px 30px rgba(220,38,38,0.3);">
                <p style="color:white; font-size:18px; margin:0 0 20px; font-weight:600;">
                  Your One-Time Password
                </p>
                <div style="
                  background:white;
                  color:#dc2626;
                  font-size:52px;
                  font-weight:900;
                  letter-spacing:18px;
                  padding:25px 15px;
                  border-radius:16px;
                  font-family:'Courier New', monospace;
                  box-shadow:0 8px 20px rgba(0,0,0,0.2);
                  border:3px solid #dc2626;
                ">
                  ${otp}
                </div>
              </div>

              <div style="background:#fee2e2; border:2px solid #dc2626; border-radius:12px; padding:20px; margin:35px 0;">
                <p style="color:#7f1d1d; font-size:17px; margin:0; font-weight:700;">
                  This OTP expires in <span style="font-size:20px;">10 minutes</span>
                </p>
              </div>

              <p style="color:#666666; font-size:15px; line-height:1.6; margin:35px 0 0;">
                If you didn’t request this OTP, please ignore this email.<br>
                Your account security is our top priority.
              </p>
            </td>
          </tr>

          <!-- RED FOOTER -->
          <tr>
            <td style="background:#dc2626; color:white; padding:35px 20px; text-align:center;">
              <p style="margin:0 0 12px; font-size:20px; font-weight:700;">
                E TIMES INDIA 24
              </p>
              <p style="margin:0; font-size:15px; color:#ffe4e4;">
                © 2025 E TIMES INDIA 24 Media • All Rights Reserved
              </p>
              <p style="margin:15px 0 0; font-size:14px; color:#ffcccc;">
                Truth First • Always
              </p>
            </td>
          </tr>
        </table>

        <p style="color:#999999; font-size:12px; margin-top:30px;">
          Need help? Write to <a href="mailto:support@etimesindia24.com" style="color:#dc2626; text-decoration:none;">support@etimesindia24.com</a>
        </p>
      </center>
    </body>
    </html>
  `,
});

    res.json({ success: true, message: "OTP sent successfully to your email." });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, message: "Failed to send OTP. Please try again later." });
  }
};

// @desc    Verify OTP & Complete Signup
// @route   POST /api/auth/signup
exports.signup = async (req, res) => {
  const { otp } = req.body;
  const tempUser = req.app.locals.tempUser;

  if (!tempUser) {
    return res.status(400).json({ success: false, message: "No signup session found. Please try again." });
  }

  if (tempUser.otpExpiry < Date.now()) {
    delete req.app.locals.tempUser;
    return res.status(400).json({ success: false, message: "OTP expired. Please refresh and try again." });
  }

  if (tempUser.otp !== parseInt(otp)) {
    return res.status(400).json({ success: false, message: "Invalid OTP" });
  }

  try {
    const hashedPassword = await bcrypt.hash(tempUser.password, 12);

    const user = await User.create({
      username: tempUser.name,
      email: tempUser.email,
      phone: tempUser.phone,
      password: hashedPassword,
    });

    delete req.app.locals.tempUser;

    // On successful signup, send a message & redirect instruction (don't login!)
    res.status(201).json({
      success: true,
      message: "Account created successfully! Redirecting to login page...",
      redirectUrl: "/login"
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error during signup." });
  }
};

// @desc    Login (Email or Phone)
// @route   POST /api/auth/login
// controller/authController.js
exports.login = async (req, res) => {
  const { identifier, password } = req.body;

  if (!identifier || !password) {
    // Always send a JSON response!
    return res.status(400).json({ success: false, message: "Please provide email/phone and password" });
  }

  try {
    const user = await User.findOne({
      $or: [{ email: identifier }, { phone: identifier }],
    }).select("+password");

    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    // Set cookie + JSON payload
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
    res.cookie("token", token, {
      expires: new Date(Date.now() + process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000),
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    return res.json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (err) {
    // Always send a JSON on error!
    console.log(err)
    res.status(500).json({ success: false, message: "Server error" });
  }
};
// @desc    Logout
// @route   POST /api/auth/logout
// controllers/authController.js

// controllers/authController.js

exports.logout = (req, res) => {
  // Clear the token cookie completely
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
  });

  // Optional: Flash message (if using connect-flash)
  // req.flash("success", "Logged out successfully!");

  // Redirect to home page
  return res.redirect("/");
};
// @desc    Get current logged in user
// @route   GET /api/auth/me
exports.getMe = async (req, res) => {
  const user = await User.findById(req.user.id);
  res.status(200).json({ success: true, user });
};