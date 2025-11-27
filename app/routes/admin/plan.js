const express = require("express");
const router = express.Router();
const ctrl = require("../../controller/admin/plan");
const adminAuth = require("../../middleware/admin.auth"); // if you have auth

// SHOW PAGE (Create + View + Edit)
router.get("/", adminAuth,ctrl.planPage);

// SAVE PLAN (Create + Edit)
router.post("/save",adminAuth, ctrl.savePlan);

// DELETE PLAN
router.get("/delete/:id",adminAuth, ctrl.deletePlan);

module.exports = router;
