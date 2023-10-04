const dataKaryawanService = require("../services/data-karyawan.service");

const inputData = async (req, res) => {
  try {
    const rawData = await dataKaryawanService.inputExcel(req.file);

    const data = rawData.map((item) => ({
      nik: item["NIK"],
      name: item["Name"],
      hire_date: item["Hire Date"],
      length_of_service: item["Length of Service"],
      position_description: item["Position Description"],
      start_position: item["Start Position"],
      length_of_position: item["Length of Position"],
      mgr_level_description: item["Mgr Level Description"],
      mpp: item["MPP"],
      mpe: item["MPE"],
      mpe_vs_mpp: item["% MPE vs MPP"],
      status: item["STATUS"],
      group: item["GROUP"],
      departmen_description: item["Department Description"],
      division_description: item["Division Descr"],
      directorat_description: item["Directorat Description"],
      location_description: item["Location Description"],
      regional: item["Regional"],
      business_unit_description: item["Business Unit Description"],
      plan_fulfillment: item["Plan Fulfillment"],
      detail_plan_fulfillment: item["Detail Plan Fulfillment"],
      nik_plan: item["NIK Plan"],
      nama_karyawan_plan_fulfillment: item["Nama Karyawan Plan Fulfillment"],
      mpe_plus_plan: item["MPE + Plan"],
      status_plan_fullfillment: item["Status Plan Fulfillment"],
    }));

    await dataKaryawanService.insertData(data);

    return res.status(201).send({
      status: 201,
      message: "Created",
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
};

const getData = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const page = parseInt(req.query.page) || 1;

    const employees = await dataKaryawanService.getData(limit, page);

    return res.status(200).send({
      status: 200,
      message: "OK",
      data: employees ,
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
};

module.exports = { inputData, getData };
