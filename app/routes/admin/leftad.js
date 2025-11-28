const express = require("express");
const router = express.Router();
const upload = require("../../multer/leftad");
const leftadController = require("../../controller/admin/leftad");
const adminAuth = require("../../middleware/admin.auth");
router.get("/",adminAuth, leftadController.getleftadPage);

router.post("/create",adminAuth, upload.single("media"), leftadController.createleftad);
router.post("/update/:id",adminAuth, upload.single("media"), leftadController.updateleftad);
router.get("/delete/:id",adminAuth, leftadController.deleteleftad);

module.exports = router;
