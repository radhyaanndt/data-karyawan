const express = require("express");

const { authentication } = require("../middleware/authentication");

const dataKaryawan = require("../../data-karyawan.json");

router = express.Router();

router.get("/", authentication, (req, res, next) => {
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

module.exports = router
