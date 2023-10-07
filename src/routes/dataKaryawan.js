const express = require("express");
const multer = require("multer");
const { authentication } = require("../middleware/authentication");
const dataKaryawanController = require("../controllers/data-karyawan.controller");

const router = express.Router();

const upload = multer({ dest: "./src/uploads/" }).single("file");

router.get("/", dataKaryawanController.getData)
router.post("/input-data", authentication, upload, dataKaryawanController.inputData);
router.get("/mpp", dataKaryawanController.getMpp)

module.exports = router;
