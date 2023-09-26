const express = require("express");
const { authentication } = require("../middleware/authentication")

const dataKaryawan = require("../../data-karyawan.json");
const authController = require("../controllers/auth.controller");

const router = express.Router();

router.post("/login", authController.login);
router.post("/register", authController.register);

router.get("/data-karyawan", authentication, (req, res, next) => {
  const regionalFilter = req.query.regional || "";

  const dataFilter = dataKaryawan.filter((item) => item.Regional === regionalFilter);

  if (!regionalFilter)
    return res.status(200).send({
      total: dataKaryawan.length,
      data: dataKaryawan,
    });

  return res.status(200).send({
    total: dataFilter.length,
    data: dataFilter,
  });
});

module.exports = router;
