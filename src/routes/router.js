const express = require("express");
const router = express.Router();

const auth = require("./auth")
const dataKaryawan = require("./dataKaryawan")

router.use("/api/v1/auth/", auth);
router.use("/api/v1/data-karyawan/", dataKaryawan);

module.exports = router;
