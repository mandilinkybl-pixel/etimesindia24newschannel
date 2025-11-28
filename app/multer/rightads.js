// config/multer.js  ← YOURS IS GOOD, BUT LET'S MAKE IT PERFECT

const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadDir = 'uploads/rightads'
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + unique + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const allowedExt = /\.(jpg|jpeg|png|gif|webp|bmp|svg|mp4|mov|avi|mkv|webm|ogg|flv|wmv|m4v)$/i;
  const allowedMime = /image|video/i.test(file.mimetype);

  if (allowedExt.test(file.originalname) && allowedMime) {
    cb(null, true);
  } else {
    cb(new Error('Only images and videos are allowed!'));
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 * 1024 }, // 100MB
  fileFilter
});

// Export both .single(), .array(), etc.
module.exports = upload;