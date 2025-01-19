const fs = require("fs-extra");
const xlsxtojson = require("xlsx-to-json");
const xlstojson = require("xls-to-json");
const httpStatus = require("http-status");
const ApiError = require("../utils/ApiError");
const { Employee_data } = require("../models");
const { Op } = require("sequelize");
const ExcelJS = require('exceljs');

const inputExcel = (file) => {
  return new Promise((resolve, reject) => {
    if (!file) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Please input file");
    }

    if (
      file.mimetype !==
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    ) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Invalid file format");
    }

    let excel2json;

    if (
      file.originalname.split(".")[file.originalname.split(".").length - 1] ===
      "xlsx"
    ) {
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

const getData = async (limit, page, search, filter) => {
  const offset = (page - 1) * limit;
  const query = search;

  const whereClauseFilter = {};

  if (
    filter[0] !== "" ||
    filter[1] !== "" ||
    filter[2] !== "" ||
    filter[3] !== "" ||
    filter[4] !== "" ||
    filter[5] !== "" ||
    filter[6] !== "" ||
    filter[7] !== "" ||
    filter[8] !== "" ||
    filter[9] !== "" ||
    filter[10] !== ""
  ) {
    whereClauseFilter[Op.and] = [];

    if (filter[0] !== "") {
      whereClauseFilter[Op.and].push({ business_unit_description: filter[0] });
    }

    if (filter[1] !== "") {
      whereClauseFilter[Op.and].push({ regional: filter[1] });
    }

    if (filter[2] !== "") {
      whereClauseFilter[Op.and].push({ group: filter[2] });
    }

    if (filter[3] !== "") {
      whereClauseFilter[Op.and].push({ location_description: filter[3] });
    }

    if (filter[4] !== "") {
      whereClauseFilter[Op.and].push({ directorat_description: filter[4] });
    }

    if (filter[5] !== "") {
      whereClauseFilter[Op.and].push({ division_description: filter[5] });
    }

    if (filter[6] !== "") {
      whereClauseFilter[Op.and].push({ status: filter[6] });
    }

    if (filter[7] !== "") {
      whereClauseFilter[Op.and].push({ position_description: filter[7] });
    }

    if (filter[8] !== "") {
      whereClauseFilter[Op.and].push({ status_plan_fulfillment: filter[8] });
    }
    if (filter[9] !== "") {
      whereClauseFilter[Op.and].push({ plan_fulfillment: filter[9] });
    }
    if (filter[10] !== "") {
      whereClauseFilter[Op.and].push({ detail_plan_fulfillment: filter[10] });
    }
  }

  const whereClause = {
    [Op.or]: [
      { name: { [Op.iLike]: `%${query}%` } },
      { regional: { [Op.iLike]: `%${query}%` } },
      { directorat_description: { [Op.iLike]: `%${query}%` } },
      { position_description: { [Op.iLike]: `%${query}%` } },
      { status_plan_fulfillment: { [Op.iLike]: `%${query}%` } },
    ],
  };

  const [employees, totalCount] = await Promise.all([
    Employee_data.findAndCountAll({
      limit,
      offset,
      attributes: { exclude: ["deletedAt"] },
      where: {
        ...whereClause,
        ...whereClauseFilter,
      },
    }),
    Employee_data.findAll({
      where: {
        ...whereClause,
        ...whereClauseFilter,
      },
    }),
  ]);

  const { rows, count } = employees;

  // regional
  if (filter[1] == "KALBAR") {
    const fulfill = totalCount.filter(
      (item) => item.status_plan_fulfillment === "FULFILL"
    ).length;
    const vacant = totalCount.filter(
      (item) => item.status_plan_fulfillment === "VACANT"
    ).length;
    const closed = totalCount.filter(
      (item) => item.status_plan_fulfillment === "CLOSED"
    ).length;
    const over_mpp = totalCount.filter(
      (item) => item.status_plan_fulfillment === "OVER MPP"
    ).length;
    const fptk_over_mpp = totalCount.filter(
      (item) => item.status_plan_fulfillment === "FPTK OVER MPP"
    ).length;

    const mpeVsMpp = totalCount.filter((value) => value.mpe_vs_mpp !== "0%");
    const parsePercentage = (percentage) => parseFloat(percentage);
    const totalValue = mpeVsMpp.reduce((total, value) => {
      return total + parsePercentage(value.mpe_vs_mpp);
    }, 0);
    const averageValue = Math.round(totalValue / mpeVsMpp.length);

    const response = {
      filter: [],
      mpe_vs_mpp: averageValue,
      fulfill: fulfill,
      vacant: vacant,
      closed: closed,
      over_mpp: over_mpp,
      fptk_over_mpp: fptk_over_mpp,
      employees: rows,
      page_size: rows.length,
      total_data: count,
      current_page: page,
      max_page: Math.ceil(count / limit),
    };

    const locationCounts = {};

    totalCount.forEach((item) => {
      const location = item.location_description;

      if (!locationCounts[location]) {
        locationCounts[location] = {
          mpp_total: 0,
          mpe_total: 0,
          mpe_plus_plan_total: 0,
        };
      }

      locationCounts[location].mpp_total += parseInt(item.mpp);
      locationCounts[location].mpe_total += parseInt(item.mpe);
      locationCounts[location].mpe_plus_plan_total += parseInt(
        item.mpe_plus_plan
      );
    });

    for (const location in locationCounts) {
      const locationObject = {
        location,
        mpp_total: locationCounts[location].mpp_total,
        mpe_total: locationCounts[location].mpe_total,
        mpe_plus_plan_total: locationCounts[location].mpe_plus_plan_total,
      };

      response.filter.push(locationObject);
    }

    return response;
  }

  if (filter[1] == "SUMATERA") {
    const fulfill = totalCount.filter(
      (item) => item.status_plan_fulfillment === "FULFILL"
    ).length;
    const vacant = totalCount.filter(
      (item) => item.status_plan_fulfillment === "VACANT"
    ).length;
    const closed = totalCount.filter(
      (item) => item.status_plan_fulfillment === "CLOSED"
    ).length;
    const over_mpp = totalCount.filter(
      (item) => item.status_plan_fulfillment === "OVER MPP"
    ).length;
    const fptk_over_mpp = totalCount.filter(
      (item) => item.status_plan_fulfillment === "FPTK OVER MPP"
    ).length;

    const mpeVsMpp = totalCount.filter((value) => value.mpe_vs_mpp !== "0%");
    const parsePercentage = (percentage) => parseFloat(percentage);
    const totalValue = mpeVsMpp.reduce((total, value) => {
      return total + parsePercentage(value.mpe_vs_mpp);
    }, 0);
    const averageValue = Math.round(totalValue / mpeVsMpp.length);

    const response = {
      filter: [],
      mpe_vs_mpp: averageValue,
      fulfill: fulfill,
      vacant: vacant,
      closed: closed,
      over_mpp: over_mpp,
      fptk_over_mpp: fptk_over_mpp,
      employees: rows,
      page_size: rows.length,
      total_data: count,
      current_page: page,
      max_page: Math.ceil(count / limit),
    };

    const locationCounts = {};

    totalCount.forEach((item) => {
      const location = item.location_description;

      if (!locationCounts[location]) {
        locationCounts[location] = {
          mpp_total: 0,
          mpe_total: 0,
          mpe_plus_plan_total: 0,
        };
      }

      locationCounts[location].mpp_total += parseInt(item.mpp);
      locationCounts[location].mpe_total += parseInt(item.mpe);
      locationCounts[location].mpe_plus_plan_total += parseInt(
        item.mpe_plus_plan
      );
    });

    for (const location in locationCounts) {
      const locationObject = {
        location,
        mpp_total: locationCounts[location].mpp_total,
        mpe_total: locationCounts[location].mpe_total,
        mpe_plus_plan_total: locationCounts[location].mpe_plus_plan_total,
      };

      response.filter.push(locationObject);
    }

    return response;
  }

  if (filter[1] == "KALTENG") {
    const fulfill = totalCount.filter(
      (item) => item.status_plan_fulfillment === "FULFILL"
    ).length;
    const vacant = totalCount.filter(
      (item) => item.status_plan_fulfillment === "VACANT"
    ).length;
    const closed = totalCount.filter(
      (item) => item.status_plan_fulfillment === "CLOSED"
    ).length;
    const over_mpp = totalCount.filter(
      (item) => item.status_plan_fulfillment === "OVER MPP"
    ).length;
    const fptk_over_mpp = totalCount.filter(
      (item) => item.status_plan_fulfillment === "FPTK OVER MPP"
    ).length;

    const mpeVsMpp = totalCount.filter((value) => value.mpe_vs_mpp !== "0%");
    const parsePercentage = (percentage) => parseFloat(percentage);
    const totalValue = mpeVsMpp.reduce((total, value) => {
      return total + parsePercentage(value.mpe_vs_mpp);
    }, 0);
    const averageValue = Math.round(totalValue / mpeVsMpp.length);

    const response = {
      filter: [],
      mpe_vs_mpp: averageValue,
      fulfill: fulfill,
      vacant: vacant,
      closed: closed,
      over_mpp: over_mpp,
      fptk_over_mpp: fptk_over_mpp,
      employees: rows,
      page_size: rows.length,
      total_data: count,
      current_page: page,
      max_page: Math.ceil(count / limit),
    };

    const locationCounts = {};

    totalCount.forEach((item) => {
      const location = item.location_description;

      if (!locationCounts[location]) {
        locationCounts[location] = {
          mpp_total: 0,
          mpe_total: 0,
          mpe_plus_plan_total: 0,
        };
      }

      locationCounts[location].mpp_total += parseInt(item.mpp);
      locationCounts[location].mpe_total += parseInt(item.mpe);
      locationCounts[location].mpe_plus_plan_total += parseInt(
        item.mpe_plus_plan
      );
    });

    for (const location in locationCounts) {
      const locationObject = {
        location,
        mpp_total: locationCounts[location].mpp_total,
        mpe_total: locationCounts[location].mpe_total,
        mpe_plus_plan_total: locationCounts[location].mpe_plus_plan_total,
      };

      response.filter.push(locationObject);
    }

    return response;
  }

  if (filter[1] == "KALTIM I") {
    const fulfill = totalCount.filter(
      (item) => item.status_plan_fulfillment === "FULFILL"
    ).length;
    const vacant = totalCount.filter(
      (item) => item.status_plan_fulfillment === "VACANT"
    ).length;
    const closed = totalCount.filter(
      (item) => item.status_plan_fulfillment === "CLOSED"
    ).length;
    const over_mpp = totalCount.filter(
      (item) => item.status_plan_fulfillment === "OVER MPP"
    ).length;
    const fptk_over_mpp = totalCount.filter(
      (item) => item.status_plan_fulfillment === "FPTK OVER MPP"
    ).length;

    const mpeVsMpp = totalCount.filter((value) => value.mpe_vs_mpp !== "0%");
    const parsePercentage = (percentage) => parseFloat(percentage);
    const totalValue = mpeVsMpp.reduce((total, value) => {
      return total + parsePercentage(value.mpe_vs_mpp);
    }, 0);
    const averageValue = Math.round(totalValue / mpeVsMpp.length);

    const response = {
      filter: [],
      mpe_vs_mpp: averageValue,
      fulfill: fulfill,
      vacant: vacant,
      closed: closed,
      over_mpp: over_mpp,
      fptk_over_mpp: fptk_over_mpp,
      employees: rows,
      page_size: rows.length,
      total_data: count,
      current_page: page,
      max_page: Math.ceil(count / limit),
    };

    const locationCounts = {};

    totalCount.forEach((item) => {
      const location = item.location_description;

      if (!locationCounts[location]) {
        locationCounts[location] = {
          mpp_total: 0,
          mpe_total: 0,
          mpe_plus_plan_total: 0,
        };
      }

      locationCounts[location].mpp_total += parseInt(item.mpp);
      locationCounts[location].mpe_total += parseInt(item.mpe);
      locationCounts[location].mpe_plus_plan_total += parseInt(
        item.mpe_plus_plan
      );
    });

    for (const location in locationCounts) {
      const locationObject = {
        location,
        mpp_total: locationCounts[location].mpp_total,
        mpe_total: locationCounts[location].mpe_total,
        mpe_plus_plan_total: locationCounts[location].mpe_plus_plan_total,
      };

      response.filter.push(locationObject);
    }

    return response;
  }

  if (filter[1] == "KALTIM II") {
    const fulfill = totalCount.filter(
      (item) => item.status_plan_fulfillment === "FULFILL"
    ).length;
    const vacant = totalCount.filter(
      (item) => item.status_plan_fulfillment === "VACANT"
    ).length;
    const closed = totalCount.filter(
      (item) => item.status_plan_fulfillment === "CLOSED"
    ).length;
    const over_mpp = totalCount.filter(
      (item) => item.status_plan_fulfillment === "OVER MPP"
    ).length;
    const fptk_over_mpp = totalCount.filter(
      (item) => item.status_plan_fulfillment === "FPTK OVER MPP"
    ).length;

    const mpeVsMpp = totalCount.filter((value) => value.mpe_vs_mpp !== "0%");
    const parsePercentage = (percentage) => parseFloat(percentage);
    const totalValue = mpeVsMpp.reduce((total, value) => {
      return total + parsePercentage(value.mpe_vs_mpp);
    }, 0);
    const averageValue = Math.round(totalValue / mpeVsMpp.length);

    const response = {
      filter: [],
      mpe_vs_mpp: averageValue,
      fulfill: fulfill,
      vacant: vacant,
      closed: closed,
      over_mpp: over_mpp,
      fptk_over_mpp: fptk_over_mpp,
      employees: rows,
      page_size: rows.length,
      total_data: count,
      current_page: page,
      max_page: Math.ceil(count / limit),
    };

    const locationCounts = {};

    totalCount.forEach((item) => {
      const location = item.location_description;

      if (!locationCounts[location]) {
        locationCounts[location] = {
          mpp_total: 0,
          mpe_total: 0,
          mpe_plus_plan_total: 0,
        };
      }

      locationCounts[location].mpp_total += parseInt(item.mpp);
      locationCounts[location].mpe_total += parseInt(item.mpe);
      locationCounts[location].mpe_plus_plan_total += parseInt(
        item.mpe_plus_plan
      );
    });

    for (const location in locationCounts) {
      const locationObject = {
        location,
        mpp_total: locationCounts[location].mpp_total,
        mpe_total: locationCounts[location].mpe_total,
        mpe_plus_plan_total: locationCounts[location].mpe_plus_plan_total,
      };

      response.filter.push(locationObject);
    }

    return response;
  }

  if (filter[1] == "KALTIM III") {
    const fulfill = totalCount.filter(
      (item) => item.status_plan_fulfillment === "FULFILL"
    ).length;
    const vacant = totalCount.filter(
      (item) => item.status_plan_fulfillment === "VACANT"
    ).length;
    const closed = totalCount.filter(
      (item) => item.status_plan_fulfillment === "CLOSED"
    ).length;
    const over_mpp = totalCount.filter(
      (item) => item.status_plan_fulfillment === "OVER MPP"
    ).length;
    const fptk_over_mpp = totalCount.filter(
      (item) => item.status_plan_fulfillment === "FPTK OVER MPP"
    ).length;

    const mpeVsMpp = totalCount.filter((value) => value.mpe_vs_mpp !== "0%");
    const parsePercentage = (percentage) => parseFloat(percentage);
    const totalValue = mpeVsMpp.reduce((total, value) => {
      return total + parsePercentage(value.mpe_vs_mpp);
    }, 0);
    const averageValue = Math.round(totalValue / mpeVsMpp.length);

    const response = {
      filter: [],
      mpe_vs_mpp: averageValue,
      fulfill: fulfill,
      vacant: vacant,
      closed: closed,
      over_mpp: over_mpp,
      fptk_over_mpp: fptk_over_mpp,
      employees: rows,
      page_size: rows.length,
      total_data: count,
      current_page: page,
      max_page: Math.ceil(count / limit),
    };

    const locationCounts = {};

    totalCount.forEach((item) => {
      const location = item.location_description;

      if (!locationCounts[location]) {
        locationCounts[location] = {
          mpp_total: 0,
          mpe_total: 0,
          mpe_plus_plan_total: 0,
        };
      }

      locationCounts[location].mpp_total += parseInt(item.mpp);
      locationCounts[location].mpe_total += parseInt(item.mpe);
      locationCounts[location].mpe_plus_plan_total += parseInt(
        item.mpe_plus_plan
      );
    });

    for (const location in locationCounts) {
      const locationObject = {
        location,
        mpp_total: locationCounts[location].mpp_total,
        mpe_total: locationCounts[location].mpe_total,
        mpe_plus_plan_total: locationCounts[location].mpe_plus_plan_total,
      };

      response.filter.push(locationObject);
    }

    return response;
  }

  if (filter[1] == "HEAD OFFICE") {
    const fulfill = totalCount.filter(
      (item) => item.status_plan_fulfillment === "FULFILL"
    ).length;
    const vacant = totalCount.filter(
      (item) => item.status_plan_fulfillment === "VACANT"
    ).length;
    const closed = totalCount.filter(
      (item) => item.status_plan_fulfillment === "CLOSED"
    ).length;
    const over_mpp = totalCount.filter(
      (item) => item.status_plan_fulfillment === "OVER MPP"
    ).length;
    const fptk_over_mpp = totalCount.filter(
      (item) => item.status_plan_fulfillment === "FPTK OVER MPP"
    ).length;

    const mpeVsMpp = totalCount.filter((value) => value.mpe_vs_mpp !== "0%");
    const parsePercentage = (percentage) => parseFloat(percentage);
    const totalValue = mpeVsMpp.reduce((total, value) => {
      return total + parsePercentage(value.mpe_vs_mpp);
    }, 0);
    const averageValue = Math.round(totalValue / mpeVsMpp.length);

    const response = {
      filter: [],
      mpe_vs_mpp: averageValue,
      fulfill: fulfill,
      vacant: vacant,
      closed: closed,
      over_mpp: over_mpp,
      fptk_over_mpp: fptk_over_mpp,
      employees: rows,
      page_size: rows.length,
      total_data: count,
      current_page: page,
      max_page: Math.ceil(count / limit),
    };

    const locationCounts = {};

    totalCount.forEach((item) => {
      const location = item.division_description;

      if (!locationCounts[location]) {
        locationCounts[location] = {
          mpp_total: 0,
          mpe_total: 0,
          mpe_plus_plan_total: 0,
        };
      }

      locationCounts[location].mpp_total += parseInt(item.mpp);
      locationCounts[location].mpe_total += parseInt(item.mpe);
      locationCounts[location].mpe_plus_plan_total += parseInt(
        item.mpe_plus_plan
      );
    });

    for (const location in locationCounts) {
      const locationObject = {
        location,
        mpp_total: locationCounts[location].mpp_total,
        mpe_total: locationCounts[location].mpe_total,
        mpe_plus_plan_total: locationCounts[location].mpe_plus_plan_total,
      };

      response.filter.push(locationObject);
    }

    return response;
  }

  const mpp_count = totalCount.filter((item) => item.mpp === "1").length;
  const mpe_count = totalCount.filter((item) => item.mpe === "1").length;
  const mpe_plus_plan_count = totalCount.filter(
    (item) => item.mpe_plus_plan === "1"
  ).length;
  
  const fulfill = totalCount.filter(
    (item) => item.status_plan_fulfillment === "FULFILL"
  ).length;
  const vacant = totalCount.filter(
    (item) => item.status_plan_fulfillment === "VACANT"
  ).length;
  const closed = totalCount.filter(
    (item) => item.status_plan_fulfillment === "CLOSED"
  ).length;
  const over_mpp = totalCount.filter(
    (item) => item.status_plan_fulfillment === "OVER MPP"
  ).length;
  const fptk_over_mpp = totalCount.filter(
    (item) => item.status_plan_fulfillment === "FPTK OVER MPP"
  ).length;

  const mpeVsMpp = totalCount.filter((value) => value.mpe_vs_mpp !== "0%");
  const parsePercentage = (percentage) => parseFloat(percentage);
  const totalValue = mpeVsMpp.reduce((total, value) => {
    return total + parsePercentage(value.mpe_vs_mpp);
  }, 0);
  const averageValue = Math.round(totalValue / mpeVsMpp.length);

  const response = {
    filter: [],
    mpe_vs_mpp: averageValue,
    fulfill: fulfill,
    vacant: vacant,
    closed: closed,
    over_mpp: over_mpp,
    fptk_over_mpp: fptk_over_mpp,
    employees: rows,
    page_size: rows.length,
    total_data: count,
    current_page: page,
    max_page: Math.ceil(count / limit),
  };
  
  const locationObject = {
    location: 'all region',
    mpp_total: mpp_count,
    mpe_total: mpe_count,
    mpe_plus_plan_total: mpe_plus_plan_count,
    
  };

  response.filter.push(locationObject);

  return response
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
      },
    ],
  };
};

const deleteData = async (targetMonth) => {
  try {
    const startDate = new Date(targetMonth + '-01');
    const endDate = new Date(new Date(targetMonth + '-01').setMonth(startDate.getMonth() + 1));

    const result = await Employee_data.destroy({
      where: {
        createdAt: {
          [Op.gte]: startDate,
          [Op.lt]: endDate,
        },
      },
    });

    return result;
  } catch (error) {
    throw error;
  }
};

const toExcel = async (data, total) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Employees');

  // Define headers for the Excel file
  const headers = [
    'ID', 'NIK', 'Name', 'Hire Date', 'Length of Service', 'Position Description',
    'Start Position', 'Length of Position', 'Manager Level', 'MPP', 'MPE', 'MPE vs MPP', 
    'Status', 'Group', 'Department', 'Division', 'Directorate', 'Location', 'Regional',
    'Business Unit', 'Plan Fulfillment', 'Plan Fulfillment Detail', 'NIK Plan', 'Employee Name Plan Fulfillment',
    'MPE Plus Plan', 'Status Plan Fulfillment', 'Created At', 'Updated At'
  ];

  // Add headers to the Excel worksheet
  worksheet.addRow(headers);

  // Add employee data rows
  data.employees.forEach(employee => {
    const row = [
      employee.id,
      employee.nik,
      employee.name,
      employee.hire_date,
      employee.length_of_service,
      employee.position_description,
      employee.start_position,
      employee.length_of_position,
      employee.mgr_level_description,
      employee.mpp,
      employee.mpe,
      employee.mpe_vs_mpp,
      employee.status,
      employee.group,
      employee.departmen_description,
      employee.division_description,
      employee.directorat_description,
      employee.location_description,
      employee.regional,
      employee.business_unit_description,
      employee.plan_fulfillment,
      employee.detail_plan_fulfillment,
      employee.nik_plan,
      employee.nama_karyawan_plan_fulfillment,
      employee.mpe_plus_plan,
      employee.status_plan_fulfillment,
      employee.createdAt,
      employee.updatedAt
    ];

    worksheet.addRow(row);
  });

  const totalHeaders = [
    'Total Summary', '', '', '', '', '', '', '', '', 'Total MPP', 'Total MPE', 'Total MPE vs MPP', 
    '', '', '', '', '', '', '', '', '', '', '', '', 'Total MPE + PLAN', 'status', ''
  ];

  worksheet.addRow(totalHeaders);
console.log("TOTAL {}", total.data)
  const totalsRow = [
    'TOTAL', // You can write "TOTAL" or any identifier you like in the first column
    '', '', '', '', '', '', '', '', 
    total.data[0].total_data, 
    total.data[1].total_data, 
    data.mpe_vs_mpp,
    '', '', '', '', '', 
    '', '', 
    data.plan_fulfillment, 
    data.detail_plan_fulfillment, 
    data.nik_plan, 
    data.nama_karyawan_plan_fulfillment,
    '',
    total.data[2].total_data,
    data.fulfill,
    data.vacant, data.over_mpp // Or any other columns for total values if needed
  ];

  worksheet.addRow(totalsRow);

  return workbook;
};

module.exports = { inputExcel, insertData, getData, getTotal, deleteData, toExcel };
