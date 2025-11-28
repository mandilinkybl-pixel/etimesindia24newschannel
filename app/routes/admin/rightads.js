const express = require("express");
const router = express.Router();
const upload = require("../../multer/rightads");
const rightadsController = require("../../controller/admin/rightads");
const adminAuth = require("../../middleware/admin.auth");
router.get("/",adminAuth, rightadsController.getrightadsPage);

router.post("/create",adminAuth, upload.single("media"), rightadsController.createrightads);
router.post("/update/:id",adminAuth, upload.single("media"), rightadsController.updaterightads);
router.get("/delete/:id",adminAuth, rightadsController.deleterightads);

module.exports = router;
