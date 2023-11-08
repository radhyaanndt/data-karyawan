const express = require("express");

const propertiesController = require("../controllers/properties.controller");

const router = express.Router();

router.get("/business", propertiesController.getBusinessUnit);
router.get("/regional", propertiesController.getRegional);
router.get("/group", propertiesController.getGroup);
// router.get("/location-description", propertiesController.getRegional);
// router.get("/directorat-description", propertiesController.getRegional);
// router.get("/division-description", propertiesController.getRegional);
// router.get("/status", propertiesController.getRegional);
// router.get("/position-description", propertiesController.getRegional);
// router.get("/status-plan-fulfillment", propertiesController.getRegional);

module.exports = router;
