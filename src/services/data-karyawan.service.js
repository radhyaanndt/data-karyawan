const fs = require("fs-extra");
const xlsxtojson = require("xlsx-to-json");
const xlstojson = require("xls-to-json");
const httpStatus = require("http-status");
const ApiError = require("../utils/ApiError");
const { Employee_data } = require("../models");
const { Op } = require("sequelize");

const inputExcel = (file) => {
  return new Promise((resolve, reject) => {
    if (!file) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Please input file");
    }

    if (file.mimetype !== "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet") {
      throw new ApiError(httpStatus.BAD_REQUEST, "Invalid file format");
    }

    let excel2json;

    if (file.originalname.split(".")[file.originalname.split(".").length - 1] === "xlsx") {
      excel2json = xlsxtojson;
    } else {
      excel2json = xlstojson;
    }

    const filePath = `./src/uploads/${file.filename}`;

    excel2json(
      {
        input: filePath,
        output: null,
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
};

const insertData = async (data) => {
  await Employee_data.bulkCreate(data);
};

const getData = async (limit, page, search) => {
  const offset = (page - 1) * limit;

  const query = search;

  const whereClause = {
    [Op.or]: [
      { regional: { [Op.iLike]: `%${query}%` } },
      { position_description: { [Op.iLike]: `%${query}%` } },
      { division_description: { [Op.iLike]: `%${query}%` } },
      { status_plan_fullfillment: { [Op.iLike]: `%${query}%` } },
    ],
  };

  const employees = await Employee_data.findAndCountAll({
    limit,
    offset,
    where: whereClause,
  });
  const { rows, count } = employees;

  return {
    employees: rows,
    page_size: rows.length,
    total_data: count,
    current_page: page,
    max_page: Math.ceil(count / limit),
  };
};

const getTotal = async () => {

  const mpp = await Employee_data.findAndCountAll({
    where: {
      mpp: "1",
    },
  });
  const mpe = await Employee_data.findAndCountAll({
    where: {
      mpe: "1",
    },
  });
  const mpe_plus_plan = await Employee_data.findAndCountAll({
    where: {
      mpe_plus_plan: "1",
    },
  });


  const employees = [mpp.count, mpe.count, mpe_plus_plan.count];

  return {
    data: [
      {
        title: "Total MPP",
        total_data: employees[0],
      },
      {
        title: "Total MPE",
        total_data: employees[1],
      },
      {
        title: "Total MPE + PLAN",
        total_data: employees[2],
      }
    ]
  };
};

module.exports = { inputExcel, insertData, getData, getTotal };
