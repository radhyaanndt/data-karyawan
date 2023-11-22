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
    filter[8] !== ""
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

  const mpeVsMpp = totalCount.filter((value) => value.mpe_vs_mpp !== "0%");
  const parsePercentage = (percentage) => parseFloat(percentage);
  const totalValue = mpeVsMpp.reduce((total, value) => {
    return total + parsePercentage(value.mpe_vs_mpp);
  }, 0);
  const averageValue = Math.round(totalValue / mpeVsMpp.length);

  const mpp_count = totalCount.filter((item) => item.mpp === "1").length;
  const mpe_count = totalCount.filter((item) => item.mpe === "1").length;
  const mpe_plus_plan_count = totalCount.filter(
    (item) => item.mpe_plus_plan === "1"
  ).length;
  const mpe_vs_mpp = totalCount.filter((item) => item.mpe === "1").length;
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

  return {
    filter: [
      {
        TOTAL: {
          mpp_total: mpp_count,
          mpe_total: mpe_count,
          mpe_plus_plan_total: mpe_plus_plan_count,
        },
      },
    ],
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

const deleteData = async (targetTimestamp) => {
  if (!targetTimestamp || targetTimestamp == "Invalid Date") {
    throw new ApiError(httpStatus.BAD_REQUEST, "Invalid date format");
  }
  const result = await Employee_data.destroy({
    where: {
      createdAt: {
        [Op.lt]: targetTimestamp,
      },
    },
  });

  return result;
};

module.exports = { inputExcel, insertData, getData, getTotal, deleteData };
