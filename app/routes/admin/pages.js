const express = require("express")
const router =express.Router()
const adminpagescontroller=require("../../controller/admin/pages")
const adminAuth = require("../../middleware/admin.auth");

router.get("/dashboard",adminAuth,adminpagescontroller.dashboard)
router.get("/",adminpagescontroller.login)

// national
router.get("/national/", adminAuth, adminpagescontroller.getAllNews);
router.get("/national/create", adminAuth, adminpagescontroller.getCreateNews);

// business
router.get("/business/", adminAuth, adminpagescontroller.getbuissnessAllNews);
router.get("/business/create", adminAuth, adminpagescontroller.getbuissnessCreateNews);
// health
router.get("/health/", adminAuth, adminpagescontroller.gethealthsAllNews);
router.get("/health/create", adminAuth, adminpagescontroller.gethealthsCreateNews);

// politics
router.get("/politics/", adminAuth, adminpagescontroller.getpoliticsAllNews);
router.get("/politics/create", adminAuth, adminpagescontroller.getpoliticsCreateNews);
// tech

router.get("/tech/", adminAuth, adminpagescontroller.gettechAllNews);
router.get("/tech/create", adminAuth, adminpagescontroller.gettechCreateNews);

// world

router.get("/world/", adminAuth, adminpagescontroller.getworldAllNews);
router.get("/world/create", adminAuth, adminpagescontroller.getworldCreateNews);


// environment

router.get("/environment/", adminAuth, adminpagescontroller.getenvironmentAllNews);
router.get("/environment/create", adminAuth, adminpagescontroller.getenvironmentCreateNews);

// education

router.get("/education/", adminAuth, adminpagescontroller.geteducationAllNews);
router.get("/education/create", adminAuth, adminpagescontroller.geteducationCreateNews);


// entertainment
router.get("/entertainment/", adminAuth, adminpagescontroller.getentertainmentAllNews);
router.get("/entertainment/create", adminAuth, adminpagescontroller.getentertainmentCreateNews);

// science

router.get("/science/", adminAuth, adminpagescontroller.getscienceAllNews);
router.get("/science/create", adminAuth, adminpagescontroller.getscienceCreateNews);

// sports
router.get("/sports/", adminAuth, adminpagescontroller.getsportsAllNews);
router.get("/sports/create", adminAuth, adminpagescontroller.getsportsCreateNews);
// crime
router.get("/crime/", adminAuth, adminpagescontroller.getcrimeAllNews);
router.get("/crime/create", adminAuth, adminpagescontroller.getcrimeCreateNews);

// live

router.get("/live/", adminAuth, adminpagescontroller.getliveAllNews);
router.get("/live/create", adminAuth, adminpagescontroller.getliveCreateNews);



module.exports = router