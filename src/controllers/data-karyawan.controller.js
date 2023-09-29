const fs = require("fs-extra");
const xlsxtojson = require("xlsx-to-json");
const xlstojson = require("xls-to-json");
const dataKaryawanService = require("../services/data-karyawan.service");

function inputData(req, res) {
  dataKaryawanService
    .inputExcel(req.file)
    .then((result) => {
      res.json(result);
    })
    .catch((error) => {
      res.json(error);
    });
}

module.exports = { inputData };
