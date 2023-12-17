const express = require("express");
const router = express.Router();

const auth = require("./auth")
const dataKaryawan = require("./dataKaryawan")
const properties = require("./properties")
const description = require("./description")

router.use("/api/v1/auth/", auth);
router.use("/api/v1/data-karyawan/", dataKaryawan);
router.use("/api/v1/properties/", properties);
router.use("/api/v1/description/", description);

module.exports = router;
