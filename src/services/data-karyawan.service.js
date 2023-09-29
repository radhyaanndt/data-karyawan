const fs = require("fs-extra");
const xlsxtojson = require("xlsx-to-json");
const xlstojson = require("xls-to-json");

function inputExcel(file) {
  return new Promise((resolve, reject) => {
    let excel2json;

    if (file.originalname.split(".")[file.originalname.split(".").length - 1] === "xlsx") {
      excel2json = xlsxtojson;
    } else {
      excel2json = xlstojson;
    }

    const filePath = `./src/uploads/${file.filename}`;

    const fileOutput = `./src/output/data-karyawan-${Date.now()}.json`;

    excel2json(
      {
        input: filePath,
        output: fileOutput,
        lowerCaseHeaders: true,
      },
      function (err, result) {
        if (err) {
          reject(err);
        } else {
          fs.remove(filePath);
          resolve(result);
        }
      }
    );
  });
}

module.exports = { inputExcel };
