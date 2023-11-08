const express = require("express");

const propertiesController = require("../controllers/properties.controller");

const router = express.Router();

router.get("/business", propertiesController.getBusinessUnit);
router.get("/regional", propertiesController.getRegional);

module.exports = router;
