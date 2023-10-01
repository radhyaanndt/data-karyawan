const dataKaryawanService = require("../services/data-karyawan.service");

const inputData = async (req, res) => {
  try {
    const data = await dataKaryawanService.inputExcel(req.file)
    return res.status(200).send({
      status: 200,
      message: "OK",
      data: data,
    });
  } catch (error) {
    if (error) {
      return res.status(error.statusCode).send({
        status: error.statusCode,
        message: "Internal Server Error",
        errors: error.message,
      });
    }
  }
}

module.exports = { inputData };
