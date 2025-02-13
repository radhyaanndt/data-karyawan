const { search } = require("..");
const ExcelJS = require('exceljs');
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
      status_plan_fulfillment: item["Status Plan Fulfillment"],
    }));

    await dataKaryawanService.insertData(data);

    return res.status(201).send({
      status: 201,
      message: "Created",
      data: data,
    });
  } catch (error) {
    if (error) {
      return res.status(500).send({
        status: 500,
        message: "Internal Server Error",
        errors: error.message,
      });
    }
  }
};

const getData = async (req, res) => {
  const limit = parseInt(req.query.limit) || 10;
  const page = parseInt(req.query.page) || 1;
  const query = req.query.search || "";
  const filter = [
    req.query.business_unit_description || "",
    req.query.regional || "",
    req.query.group || "",
    req.query.location_description || "",
    req.query.directorat_description || "",
    req.query.division_description || "",
    req.query.status || "",
    req.query.position_description || "",
    req.query.status_plan_fulfillment || "",
    req.query.plan_fulfillment || "",
    req.query.detail_plan_fulfillment || "",
  ];

  try {
    const employees = await dataKaryawanService.getData(
      limit,
      page,
      query,
      filter
    );

    return res.status(200).send({
      status: 200,
      message: "OK",
      data: employees,
    });
  } catch (error) {
    if (error) {
      return res.status(500).send({
        status: 500,
        message: "Internal Server Error",
        errors: error.message,
      });
    }
  }
};

const getTotal = async (req, res) => {
  try {
    const employees = await dataKaryawanService.getTotal();

    return res.status(200).send({
      status: 200,
      message: "OK",
      data: employees,
    });
  } catch (error) {
    if (error) {
      return res.status(500).send({
        status: 500,
        message: "Internal Server Error",
        errors: error.message,
      });
    }
  }
};

const deleteData = async (req, res) => {
  try {
    const targetMonth = req.query.targetMonth;

    if (!/^\d{4}-\d{2}$/.test(targetMonth)) {
      return res.status(400).send({
        status: 400,
        message: "Invalid targetMonth format. Please use YYYY-MM format.",
      });
    }

    const result = await dataKaryawanService.deleteData(targetMonth);

    if (result > 0) {
      return res.status(200).send({
        status: 200,
        message: "Data Deleted",
      });
    } else {
      res.status(404).send({
        status: 404,
        message: "No data met the criteria for deletion",
      });
    }
  } catch (error) {
    return res.status(500).send({
      status: 500,
      message: "Internal Server Error",
      errors: error.message,
    });
  }
};

const generateExcel = async (req, res) => {
  const limit = parseInt(req.query.limit) || 1000;
  const page = parseInt(req.query.page) || 1;
  const query = req.query.search || "";
  const filter = [
    req.query.business_unit_description || "",
    req.query.regional || "",
    req.query.group || "",
    req.query.location_description || "",
    req.query.directorat_description || "",
    req.query.division_description || "",
    req.query.status || "",
    req.query.position_description || "",
    req.query.status_plan_fulfillment || "",
    req.query.plan_fulfillment || "",
    req.query.detail_plan_fulfillment || "",
  ];
  try {
    const data = await dataKaryawanService.getData(limit, page, query, filter);
    const total = await dataKaryawanService.getTotal()
    const workbook = await dataKaryawanService.toExcel(data, total);

    // Set response headers to indicate it's an Excel file
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader("Content-Disposition", "attachment; filename=employees.xlsx");

    // Send the Excel file to the client
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error("Error generating Excel file:", error);
    res.status(500).send("Internal Server Error");
  }
};

module.exports = { inputData, getData, getTotal, deleteData, generateExcel };
