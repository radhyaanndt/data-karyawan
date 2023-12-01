const express = require("express");
const multer = require("multer");
const { authentication } = require("../middleware/authentication");
const dataKaryawanController = require("../controllers/data-karyawan.controller");
const employee_data = require("../models/employee_data");

const router = express.Router();

const upload = multer({ dest: "./src/uploads/" }).single("file");

router.get("/", dataKaryawanController.getData)
router.post("/input-data", authentication, upload, dataKaryawanController.inputData);
router.get("/total", dataKaryawanController.getTotal)
router.delete("/delete", authentication, dataKaryawanController.deleteData)

module.exports = router;
