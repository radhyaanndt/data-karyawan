const express = require("express");
const router = express.Router();

const auth = require("./auth")
const dataKaryawan = require("./dataKaryawan")
const properties = require("./properties")

router.use("/api/v1/auth/", auth);
router.use("/api/v1/data-karyawan/", dataKaryawan);
router.use("/api/v1/properties/", properties);

module.exports = router;
