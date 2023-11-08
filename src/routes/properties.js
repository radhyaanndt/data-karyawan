const express = require("express");

const propertiesController = require("../controllers/properties.controller");

const router = express.Router();

router.get("/business", propertiesController.getBusinessUnit);
router.get("/regional", propertiesController.getRegional);
router.get("/group", propertiesController.getGroup);
router.get("/location-description", propertiesController.getLocationDescription);
router.get("/directorat-description", propertiesController.getDirectoratDescription);
router.get("/division-description", propertiesController.getDivisionDescription);
router.get("/status", propertiesController.getStatus);
router.get("/position-description", propertiesController.getPositionDescription);
router.get("/status-plan-fulfillment", propertiesController.getStatusPlanFulfillment);

module.exports = router;
