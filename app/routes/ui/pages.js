// routes/ui.js or app.js
const express = require('express');
const router = express.Router();
const uipagescontroller = require('../../controller/ui/pages');
const { protect } = require('../../middleware/auth');

// Correct order matters!
router.get('/', protect,uipagescontroller.home);        // Home page
router.get('/login', uipagescontroller.login);  // Login page

router.get("/busines",protect,uipagescontroller.getBusiness)
router.get("/education",protect,uipagescontroller.getEducation)
router.get("/entertainment",protect,uipagescontroller.getEntertainment)
router.get("/environment",protect,uipagescontroller.getEnvironment)
router.get("/health",protect,uipagescontroller.getHealth)
router.get("/live",protect,uipagescontroller.getLive)
router.get("/politics",protect,uipagescontroller.getPolitics)
router.get("/sports",protect,uipagescontroller.getSports)
router.get("/technology",protect,uipagescontroller.getTechnology)
router.get("/world",protect,uipagescontroller.getWorld)
router.get("/science",protect,uipagescontroller.getscience)
router.get("/crime",protect,uipagescontroller.getcrime)
router.get("/national",protect,uipagescontroller.getnational)


router.get("/plans",protect,uipagescontroller.getPlansPage)
router.get("/subscribe/:id",protect,uipagescontroller.renderPurchaseDetail)

router.get("/terms",protect,uipagescontroller.getterms)
router.get("/privacy",protect,uipagescontroller.getprivacy)

router.get("/politics/:id",protect,uipagescontroller.getNewsDetails)
router.get("/crime/:id",protect,uipagescontroller.getcrimeNewsDetails)
router.get("/national/news/:id",protect,uipagescontroller.getNationalNewsDetails)
router.get("/technology/:id",protect,uipagescontroller.getTechnologyNewsDetails)
router.get("/business/:id",protect,uipagescontroller.getBusinessNewsDetails)
router.get("/science/:id",protect,uipagescontroller.getScienceDetails)
router.get("/world/:id",protect,uipagescontroller.getWorldNewsDetails)
router.get("/environment/:id",protect,uipagescontroller.getEnvironmentNewsDetails)
router.get("/entertainment/:id",protect,uipagescontroller.getEntertainmentNewsDetails)
router.get("/education/:id",protect,uipagescontroller.getEducationNewsDetails)
router.get("/health/:id",protect,uipagescontroller.getHealthDetails)
router.get("/sports/:id",protect,uipagescontroller.getSportsNewsDetails)
router.get("/live/:id",protect,uipagescontroller.getLiveDetails)


















module.exports = router;