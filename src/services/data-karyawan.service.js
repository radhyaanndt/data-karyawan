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
    const mpp_count_abm = totalCount.filter(
      (item) => item.mpp === "1" && item.location_description == "ABM"
    ).length;
    const mpp_count_ats = totalCount.filter(
      (item) => item.mpp === "1" && item.location_description == "ATS"
    ).length;
    const mpp_count_bsm = totalCount.filter(
      (item) => item.mpp === "1" && item.location_description == "BSM"
    ).length;

    const mpe_count_abm = totalCount.filter(
      (item) => item.mpe === "1" && item.location_description == "ABM"
    ).length;
    const mpe_count_ats = totalCount.filter(
      (item) => item.mpe === "1" && item.location_description == "ATS"
    ).length;
    const mpe_count_bsm = totalCount.filter(
      (item) => item.mpe === "1" && item.location_description == "BSM"
    ).length;

    const mpe_plus_plan_count_abm = totalCount.filter(
      (item) => item.mpe_plus_plan === "1" && item.location_description == "ABM"
    ).length;
    const mpe_plus_plan_count_ats = totalCount.filter(
      (item) => item.mpe_plus_plan === "1" && item.location_description == "ATS"
    ).length;
    const mpe_plus_plan_count_bsm = totalCount.filter(
      (item) => item.mpe_plus_plan === "1" && item.location_description == "BSM"
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
    return {
      filter: [
        {
          ABM: {
            mpp_total: mpp_count_abm,
            mpe_total: mpe_count_abm,
            mpe_plus_plan_total: mpe_plus_plan_count_abm,
          },
          ATS: {
            mpp_total: mpp_count_ats,
            mpe_total: mpe_count_ats,
            mpe_plus_plan_total: mpe_plus_plan_count_ats,
          },
          BSM: {
            mpp_total: mpp_count_bsm,
            mpe_total: mpe_count_bsm,
            mpe_plus_plan_total: mpe_plus_plan_count_bsm,
          },
        },
      ],
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
  }

  if (filter[1] == "SUMATERA") {
    const mpp_count_batang = totalCount.filter(
      (item) =>
        item.mpp === "1" && item.location_description == "BBB - BATANG HARI"
    ).length;
    const mpp_count_inti = totalCount.filter(
      (item) => item.mpp === "1" && item.location_description == "BBB - INTI"
    ).length;
    const mpp_count_karet = totalCount.filter(
      (item) => item.mpp === "1" && item.location_description == "BBB - KARET"
    ).length;
    const mpp_count_mill = totalCount.filter(
      (item) => item.mpp === "1" && item.location_description == "BBB - MILL"
    ).length;
    const mpp_count_plasma = totalCount.filter(
      (item) =>
        item.mpp === "1" && item.location_description == "BBB - PLASMA 1 & 2"
    ).length;
    const mpp_count_trading = totalCount.filter(
      (item) => item.mpp === "1" && item.location_description == "BBB - TRADING"
    ).length;
    const mpp_count_head = totalCount.filter(
      (item) =>
        item.mpp === "1" && item.location_description == "HEAD OFFICE - BBB"
    ).length;
    const mpp_count_region = totalCount.filter(
      (item) =>
        item.mpp === "1" &&
        item.location_description == "REGION OFFICE SUMATERA"
    ).length;

    const mpe_count_batang = totalCount.filter(
      (item) =>
        item.mpe === "1" && item.location_description == "BBB - BATANG HARI"
    ).length;
    const mpe_count_inti = totalCount.filter(
      (item) => item.mpe === "1" && item.location_description == "BBB - INTI"
    ).length;
    const mpe_count_karet = totalCount.filter(
      (item) => item.mpe === "1" && item.location_description == "BBB - KARET"
    ).length;
    const mpe_count_mill = totalCount.filter(
      (item) => item.mpe === "1" && item.location_description == "BBB - MILL"
    ).length;
    const mpe_count_plasma = totalCount.filter(
      (item) =>
        item.mpe === "1" && item.location_description == "BBB - PLASMA 1 & 2"
    ).length;
    const mpe_count_trading = totalCount.filter(
      (item) => item.mpe === "1" && item.location_description == "BBB - TRADING"
    ).length;
    const mpe_count_head = totalCount.filter(
      (item) =>
        item.mpe === "1" && item.location_description == "HEAD OFFICE - BBB"
    ).length;
    const mpe_count_region = totalCount.filter(
      (item) =>
        item.mpe === "1" &&
        item.location_description == "REGION OFFICE SUMATERA"
    ).length;

    const mpe_plus_plan_count_batang = totalCount.filter(
      (item) =>
        item.mpe_plus_plan === "1" &&
        item.location_description == "BBB - BATANG HARI"
    ).length;
    const mpe_plus_plan_count_inti = totalCount.filter(
      (item) =>
        item.mpe_plus_plan === "1" && item.location_description == "BBB - INTI"
    ).length;
    const mpe_plus_plan_count_karet = totalCount.filter(
      (item) =>
        item.mpe_plus_plan === "1" && item.location_description == "BBB - KARET"
    ).length;
    const mpe_plus_plan_count_mill = totalCount.filter(
      (item) =>
        item.mpe_plus_plan === "1" && item.location_description == "BBB - MILL"
    ).length;
    const mpe_plus_plan_count_plasma = totalCount.filter(
      (item) =>
        item.mpe_plus_plan === "1" &&
        item.location_description == "BBB - PLASMA 1 & 2"
    ).length;
    const mpe_plus_plan_count_trading = totalCount.filter(
      (item) =>
        item.mpe_plus_plan === "1" &&
        item.location_description == "BBB - TRADING"
    ).length;
    const mpe_plus_plan_count_head = totalCount.filter(
      (item) =>
        item.mpe_plus_plan === "1" &&
        item.location_description == "HEAD OFFICE - BBB"
    ).length;
    const mpe_plus_plan_count_region = totalCount.filter(
      (item) =>
        item.mpe_plus_plan === "1" &&
        item.location_description == "REGION OFFICE SUMATERA"
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
    return {
      filter: [
        {
          BATANG_HARI: {
            mpp_total: mpp_count_batang,
            mpe_total: mpe_count_batang,
            mpe_plus_plan_total: mpe_plus_plan_count_batang,
          },
          INTI: {
            mpp_total: mpp_count_inti,
            mpe_total: mpe_count_inti,
            mpe_plus_plan_total: mpe_plus_plan_count_inti,
          },
          KARET: {
            mpp_total: mpp_count_karet,
            mpe_total: mpe_count_karet,
            mpe_plus_plan_total: mpe_plus_plan_count_karet,
          },
          MILL: {
            mpp_total: mpp_count_mill,
            mpe_total: mpe_count_mill,
            mpe_plus_plan_total: mpe_plus_plan_count_mill,
          },
          PLASMA: {
            mpp_total: mpp_count_plasma,
            mpe_total: mpe_count_plasma,
            mpe_plus_plan_total: mpe_plus_plan_count_plasma,
          },
          TRADING: {
            mpp_total: mpp_count_trading,
            mpe_total: mpe_count_trading,
            mpe_plus_plan_total: mpe_plus_plan_count_trading,
          },
          HO_BBB: {
            mpp_total: mpp_count_head,
            mpe_total: mpe_count_head,
            mpe_plus_plan_total: mpe_plus_plan_count_head,
          },
          RO_SUMATERA: {
            mpp_total: mpp_count_region,
            mpe_total: mpe_count_region,
            mpe_plus_plan_total: mpe_plus_plan_count_region,
          },
        },
      ],
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
  }

  if (filter[1] == "KALTENG") {
    const mpp_count_flti = totalCount.filter(
      (item) => item.mpp === "1" && item.location_description == "FLTI"
    ).length;
    const mpp_count_flti_mill = totalCount.filter(
      (item) => item.mpp === "1" && item.location_description == "FLTI - MILL"
    ).length;
    const mpp_count_flti_trading = totalCount.filter(
      (item) =>
        item.mpp === "1" && item.location_description == "FLTI - TRADING"
    ).length;
    const mpp_count_gbsm1 = totalCount.filter(
      (item) => item.mpp === "1" && item.location_description == "GBSM - EST 1"
    ).length;
    const mpp_count_gbsm2 = totalCount.filter(
      (item) => item.mpp === "1" && item.location_description == "GBSM - EST 2"
    ).length;
    const mpp_count_gbsm3 = totalCount.filter(
      (item) => item.mpp === "1" && item.location_description == "GBSM - EST 3"
    ).length;
    const mpp_count_gbsm_a = totalCount.filter(
      (item) => item.mpp === "1" && item.location_description == "GBSM - MILL A"
    ).length;
    const mpp_count_gbsm_b = totalCount.filter(
      (item) => item.mpp === "1" && item.location_description == "GBSM - MILL B"
    ).length;
    const mpp_count_gbsm_trading = totalCount.filter(
      (item) =>
        item.mpp === "1" && item.location_description == "GBSM - TRADING"
    ).length;
    const mpp_count_ho_gbsm2 = totalCount.filter(
      (item) =>
        item.mpp === "1" && item.location_description == "HEAD OFFICE - GBSM2"
    ).length;
    const mpp_count_ho_gbsm3 = totalCount.filter(
      (item) =>
        item.mpp === "1" && item.location_description == "HEAD OFFICE - GBSM3"
    ).length;
    const mpp_count_hps = totalCount.filter(
      (item) => item.mpp === "1" && item.location_description == "HPS"
    ).length;
    const mpp_count_mik = totalCount.filter(
      (item) => item.mpp === "1" && item.location_description == "MIK"
    ).length;
    const mpp_count_ro_kalteng = totalCount.filter(
      (item) =>
        item.mpp === "1" && item.location_description == "REGION OFFICE KALTENG"
    ).length;
    const mpp_count_skm = totalCount.filter(
      (item) => item.mpp === "1" && item.location_description == "SKM"
    ).length;
    const mpp_count_skm_mill = totalCount.filter(
      (item) => item.mpp === "1" && item.location_description == "SKM - MILL"
    ).length;
    const mpp_count_skm_mill_bio = totalCount.filter(
      (item) =>
        item.mpp === "1" &&
        item.location_description == "SKM - MILL KCP & BIOGAS"
    ).length;
    const mpp_count_skm_trading = totalCount.filter(
      (item) => item.mpp === "1" && item.location_description == "SKM - TRADING"
    ).length;
    const mpp_count_tan = totalCount.filter(
      (item) => item.mpp === "1" && item.location_description == "TAN"
    ).length;

    const mpe_count_flti = totalCount.filter(
      (item) => item.mpe === "1" && item.location_description == "FLTI"
    ).length;
    const mpe_count_flti_mill = totalCount.filter(
      (item) => item.mpe === "1" && item.location_description == "FLTI - MILL"
    ).length;
    const mpe_count_flti_trading = totalCount.filter(
      (item) =>
        item.mpe === "1" && item.location_description == "FLTI - TRADING"
    ).length;
    const mpe_count_gbsm1 = totalCount.filter(
      (item) => item.mpe === "1" && item.location_description == "GBSM - EST 1"
    ).length;
    const mpe_count_gbsm2 = totalCount.filter(
      (item) => item.mpe === "1" && item.location_description == "GBSM - EST 2"
    ).length;
    const mpe_count_gbsm3 = totalCount.filter(
      (item) => item.mpe === "1" && item.location_description == "GBSM - EST 3"
    ).length;
    const mpe_count_gbsm_a = totalCount.filter(
      (item) => item.mpe === "1" && item.location_description == "GBSM - MILL A"
    ).length;
    const mpe_count_gbsm_b = totalCount.filter(
      (item) => item.mpe === "1" && item.location_description == "GBSM - MILL B"
    ).length;
    const mpe_count_gbsm_trading = totalCount.filter(
      (item) =>
        item.mpe === "1" && item.location_description == "GBSM - TRADING"
    ).length;
    const mpe_count_ho_gbsm2 = totalCount.filter(
      (item) =>
        item.mpe === "1" && item.location_description == "HEAD OFFICE - GBSM2"
    ).length;
    const mpe_count_ho_gbsm3 = totalCount.filter(
      (item) =>
        item.mpe === "1" && item.location_description == "HEAD OFFICE - GBSM3"
    ).length;
    const mpe_count_hps = totalCount.filter(
      (item) => item.mpe === "1" && item.location_description == "HPS"
    ).length;
    const mpe_count_mik = totalCount.filter(
      (item) => item.mpe === "1" && item.location_description == "MIK"
    ).length;
    const mpe_count_ro_kalteng = totalCount.filter(
      (item) =>
        item.mpe === "1" && item.location_description == "REGION OFFICE KALTENG"
    ).length;
    const mpe_count_skm = totalCount.filter(
      (item) => item.mpe === "1" && item.location_description == "SKM"
    ).length;
    const mpe_count_skm_mill = totalCount.filter(
      (item) => item.mpe === "1" && item.location_description == "SKM - MILL"
    ).length;
    const mpe_count_skm_mill_bio = totalCount.filter(
      (item) =>
        item.mpe === "1" &&
        item.location_description == "SKM - MILL KCP & BIOGAS"
    ).length;
    const mpe_count_skm_trading = totalCount.filter(
      (item) => item.mpe === "1" && item.location_description == "SKM - TRADING"
    ).length;
    const mpe_count_tan = totalCount.filter(
      (item) => item.mpe === "1" && item.location_description == "TAN"
    ).length;

    const mpe_plus_plan_count_flti = totalCount.filter(
      (item) =>
        item.mpe_plus_plan === "1" && item.location_description == "FLTI"
    ).length;
    const mpe_plus_plan_count_flti_mill = totalCount.filter(
      (item) =>
        item.mpe_plus_plan === "1" && item.location_description == "FLTI - MILL"
    ).length;
    const mpe_plus_plan_count_flti_trading = totalCount.filter(
      (item) =>
        item.mpe_plus_plan === "1" &&
        item.location_description == "FLTI - TRADING"
    ).length;
    const mpe_plus_plan_count_gbsm1 = totalCount.filter(
      (item) =>
        item.mpe_plus_plan === "1" &&
        item.location_description == "GBSM - EST 1"
    ).length;
    const mpe_plus_plan_count_gbsm2 = totalCount.filter(
      (item) =>
        item.mpe_plus_plan === "1" &&
        item.location_description == "GBSM - EST 2"
    ).length;
    const mpe_plus_plan_count_gbsm3 = totalCount.filter(
      (item) =>
        item.mpe_plus_plan === "1" &&
        item.location_description == "GBSM - EST 3"
    ).length;
    const mpe_plus_plan_count_gbsm_a = totalCount.filter(
      (item) =>
        item.mpe_plus_plan === "1" &&
        item.location_description == "GBSM - MILL A"
    ).length;
    const mpe_plus_plan_count_gbsm_b = totalCount.filter(
      (item) =>
        item.mpe_plus_plan === "1" &&
        item.location_description == "GBSM - MILL B"
    ).length;
    const mpe_plus_plan_count_gbsm_trading = totalCount.filter(
      (item) =>
        item.mpe_plus_plan === "1" &&
        item.location_description == "GBSM - TRADING"
    ).length;
    const mpe_plus_plan_count_ho_gbsm2 = totalCount.filter(
      (item) =>
        item.mpe_plus_plan === "1" &&
        item.location_description == "HEAD OFFICE - GBSM2"
    ).length;
    const mpe_plus_plan_count_ho_gbsm3 = totalCount.filter(
      (item) =>
        item.mpe_plus_plan === "1" &&
        item.location_description == "HEAD OFFICE - GBSM3"
    ).length;
    const mpe_plus_plan_count_hps = totalCount.filter(
      (item) => item.mpe_plus_plan === "1" && item.location_description == "HPS"
    ).length;
    const mpe_plus_plan_count_mik = totalCount.filter(
      (item) => item.mpe_plus_plan === "1" && item.location_description == "MIK"
    ).length;
    const mpe_plus_plan_count_ro_kalteng = totalCount.filter(
      (item) =>
        item.mpe_plus_plan === "1" &&
        item.location_description == "REGION OFFICE KALTENG"
    ).length;
    const mpe_plus_plan_count_skm = totalCount.filter(
      (item) => item.mpe_plus_plan === "1" && item.location_description == "SKM"
    ).length;
    const mpe_plus_plan_count_skm_mill = totalCount.filter(
      (item) =>
        item.mpe_plus_plan === "1" && item.location_description == "SKM - MILL"
    ).length;
    const mpe_plus_plan_count_skm_mill_bio = totalCount.filter(
      (item) =>
        item.mpe_plus_plan === "1" &&
        item.location_description == "SKM - MILL KCP & BIOGAS"
    ).length;
    const mpe_plus_plan_count_skm_trading = totalCount.filter(
      (item) =>
        item.mpe_plus_plan === "1" &&
        item.location_description == "SKM - TRADING"
    ).length;
    const mpe_plus_plan_count_tan = totalCount.filter(
      (item) => item.mpe_plus_plan === "1" && item.location_description == "TAN"
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
    return {
      filter: [
        {
          FLTI: {
            mpp_total: mpp_count_flti,
            mpe_total: mpe_count_flti,
            mpe_plus_plan_total: mpe_plus_plan_count_flti,
          },
          FLTI_MILL: {
            mpp_total: mpp_count_flti_mill,
            mpe_total: mpe_count_flti_mill,
            mpe_plus_plan_total: mpe_plus_plan_count_flti_mill,
          },
          FLTI_TRADING: {
            mpp_total: mpp_count_flti_trading,
            mpe_total: mpe_count_flti_trading,
            mpe_plus_plan_total: mpe_plus_plan_count_flti_trading,
          },
          GBSM1: {
            mpp_total: mpp_count_gbsm1,
            mpe_total: mpe_count_gbsm1,
            mpe_plus_plan_total: mpe_plus_plan_count_gbsm1,
          },
          GBSM2: {
            mpp_total: mpp_count_gbsm2,
            mpe_total: mpe_count_gbsm2,
            mpe_plus_plan_total: mpe_plus_plan_count_gbsm2,
          },
          GBSM3: {
            mpp_total: mpp_count_gbsm3,
            mpe_total: mpe_count_gbsm3,
            mpe_plus_plan_total: mpe_plus_plan_count_gbsm3,
          },
          GBSM_A: {
            mpp_total: mpp_count_gbsm_a,
            mpe_total: mpe_count_gbsm_a,
            mpe_plus_plan_total: mpe_plus_plan_count_gbsm_a,
          },
          GBSM_B: {
            mpp_total: mpp_count_gbsm_b,
            mpe_total: mpe_count_gbsm_b,
            mpe_plus_plan_total: mpe_plus_plan_count_gbsm_b,
          },
          GBSM_TRADING: {
            mpp_total: mpp_count_gbsm_trading,
            mpe_total: mpe_count_gbsm_trading,
            mpe_plus_plan_total: mpe_plus_plan_count_gbsm_trading,
          },
          HO_GSBM2: {
            mpp_total: mpp_count_ho_gbsm2,
            mpe_total: mpe_count_ho_gbsm2,
            mpe_plus_plan_total: mpe_plus_plan_count_ho_gbsm2,
          },
          HO_GBSM3: {
            mpp_total: mpp_count_ho_gbsm3,
            mpe_total: mpe_count_ho_gbsm3,
            mpe_plus_plan_total: mpe_plus_plan_count_ho_gbsm3,
          },
          HPS: {
            mpp_total: mpp_count_hps,
            mpe_total: mpe_count_hps,
            mpe_plus_plan_total: mpe_plus_plan_count_hps,
          },
          MIK: {
            mpp_total: mpp_count_mik,
            mpe_total: mpe_count_mik,
            mpe_plus_plan_total: mpe_plus_plan_count_mik,
          },
          RO_KALTENG: {
            mpp_total: mpp_count_ro_kalteng,
            mpe_total: mpe_count_ro_kalteng,
            mpe_plus_plan_total: mpe_plus_plan_count_ro_kalteng,
          },
          SKM: {
            mpp_total: mpp_count_skm,
            mpe_total: mpe_count_skm,
            mpe_plus_plan_total: mpe_plus_plan_count_skm,
          },
          SKM_MILL: {
            mpp_total: mpp_count_skm_mill,
            mpe_total: mpe_count_skm_mill,
            mpe_plus_plan_total: mpe_plus_plan_count_skm_mill,
          },
          SKM_MILL_BIO: {
            mpp_total: mpp_count_skm_mill_bio,
            mpe_total: mpe_count_skm_mill_bio,
            mpe_plus_plan_total: mpe_plus_plan_count_skm_mill_bio,
          },
          SKM_TRADING: {
            mpp_total: mpp_count_skm_trading,
            mpe_total: mpe_count_skm_trading,
            mpe_plus_plan_total: mpe_plus_plan_count_skm_trading,
          },
          TAN: {
            mpp_total: mpp_count_tan,
            mpe_total: mpe_count_tan,
            mpe_plus_plan_total: mpe_plus_plan_count_tan,
          },
        },
      ],
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
  }

  if (filter[1] == "KALTIM I") {
    const mpp_count_dlj_mill = totalCount.filter(
      (item) => item.mpp === "1" && item.location_description == "DLJ - MILL"
    ).length;
    const mpp_count_dlj_trading = totalCount.filter(
      (item) => item.mpp === "1" && item.location_description == "DLJ - TRADING"
    ).length;
    const mpp_count_dlj1 = totalCount.filter(
      (item) => item.mpp === "1" && item.location_description == "DLJ1"
    ).length;
    const mpp_count_dlj2 = totalCount.filter(
      (item) => item.mpp === "1" && item.location_description == "DLJ2"
    ).length;
    const mpp_count_ebl = totalCount.filter(
      (item) => item.mpp === "1" && item.location_description == "EBL"
    ).length;
    const mpp_count_ebl_mill = totalCount.filter(
      (item) => item.mpp === "1" && item.location_description == "EBL - MILL"
    ).length;
    const mpp_count_ebl_trading = totalCount.filter(
      (item) => item.mpp === "1" && item.location_description == "EBL - TRADING"
    ).length;
    const mpp_count_ksd = totalCount.filter(
      (item) => item.mpp === "1" && item.location_description == "KSD"
    ).length;
    const mpp_count_ksd_mill = totalCount.filter(
      (item) => item.mpp === "1" && item.location_description == "KSD - MILL"
    ).length;
    const mpp_count_ro_kaltim = totalCount.filter(
      (item) =>
        item.mpp === "1" && item.location_description == "REGION OFFICE KALTIM"
    ).length;

    const mpe_count_dlj_mill = totalCount.filter(
      (item) => item.mpe === "1" && item.location_description == "DLJ - MILL"
    ).length;
    const mpe_count_dlj_trading = totalCount.filter(
      (item) => item.mpe === "1" && item.location_description == "DLJ - TRADING"
    ).length;
    const mpe_count_dlj1 = totalCount.filter(
      (item) => item.mpe === "1" && item.location_description == "DLJ1"
    ).length;
    const mpe_count_dlj2 = totalCount.filter(
      (item) => item.mpe === "1" && item.location_description == "DLJ2"
    ).length;
    const mpe_count_ebl = totalCount.filter(
      (item) => item.mpe === "1" && item.location_description == "EBL"
    ).length;
    const mpe_count_ebl_mill = totalCount.filter(
      (item) => item.mpe === "1" && item.location_description == "EBL - MILL"
    ).length;
    const mpe_count_ebl_trading = totalCount.filter(
      (item) => item.mpe === "1" && item.location_description == "EBL - TRADING"
    ).length;
    const mpe_count_ksd = totalCount.filter(
      (item) => item.mpe === "1" && item.location_description == "KSD"
    ).length;
    const mpe_count_ksd_mill = totalCount.filter(
      (item) => item.mpe === "1" && item.location_description == "KSD - MILL"
    ).length;
    const mpe_count_ro_kaltim = totalCount.filter(
      (item) =>
        item.mpe === "1" && item.location_description == "REGION OFFICE KALTIM"
    ).length;

    const mpe_plus_plan_count_dlj_mill = totalCount.filter(
      (item) => item.mpp === "1" && item.location_description == "DLJ - MILL"
    ).length;
    const mpe_plus_plan_count_dlj_trading = totalCount.filter(
      (item) => item.mpp === "1" && item.location_description == "DLJ - TRADING"
    ).length;
    const mpe_plus_plan_count_dlj1 = totalCount.filter(
      (item) => item.mpp === "1" && item.location_description == "DLJ1"
    ).length;
    const mpe_plus_plan_count_dlj2 = totalCount.filter(
      (item) => item.mpp === "1" && item.location_description == "DLJ2"
    ).length;
    const mpe_plus_plan_count_ebl = totalCount.filter(
      (item) => item.mpp === "1" && item.location_description == "EBL"
    ).length;
    const mpe_plus_plan_count_ebl_mill = totalCount.filter(
      (item) => item.mpp === "1" && item.location_description == "EBL - MILL"
    ).length;
    const mpe_plus_plan_count_ebl_trading = totalCount.filter(
      (item) => item.mpp === "1" && item.location_description == "EBL - TRADING"
    ).length;
    const mpe_plus_plan_count_ksd = totalCount.filter(
      (item) => item.mpp === "1" && item.location_description == "KSD"
    ).length;
    const mpe_plus_plan_count_ksd_mill = totalCount.filter(
      (item) => item.mpp === "1" && item.location_description == "KSD - MILL"
    ).length;
    const mpe_plus_plan_count_ro_kaltim = totalCount.filter(
      (item) =>
        item.mpp === "1" && item.location_description == "REGION OFFICE KALTIM"
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
    return {
      filter: [
        {
          DLJ_MILL: {
            mpp_total: mpp_count_dlj_mill,
            mpe_total: mpe_count_dlj_mill,
            mpe_plus_plan_total: mpe_plus_plan_count_dlj_mill,
          },
          DLJ_TRADING: {
            mpp_total: mpp_count_dlj_trading,
            mpe_total: mpe_count_dlj_trading,
            mpe_plus_plan_total: mpe_plus_plan_count_dlj_trading,
          },
          DLJ1: {
            mpp_total: mpp_count_dlj1,
            mpe_total: mpe_count_dlj1,
            mpe_plus_plan_total: mpe_plus_plan_count_dlj1,
          },
          DLJ2: {
            mpp_total: mpp_count_dlj2,
            mpe_total: mpe_count_dlj2,
            mpe_plus_plan_total: mpe_plus_plan_count_dlj2,
          },
          EBL: {
            mpp_total: mpp_count_ebl,
            mpe_total: mpe_count_ebl,
            mpe_plus_plan_total: mpe_plus_plan_count_ebl,
          },
          EBL_MILL: {
            mpp_total: mpp_count_ebl_mill,
            mpe_total: mpe_count_ebl_mill,
            mpe_plus_plan_total: mpe_plus_plan_count_ebl_mill,
          },
          EBL_TRADING: {
            mpp_total: mpp_count_ebl_trading,
            mpe_total: mpe_count_ebl_trading,
            mpe_plus_plan_total: mpe_plus_plan_count_ebl_trading,
          },
          KSD: {
            mpp_total: mpp_count_ksd,
            mpe_total: mpe_count_ksd,
            mpe_plus_plan_total: mpe_plus_plan_count_ksd,
          },
          KSD_MILL: {
            mpp_total: mpp_count_ksd_mill,
            mpe_total: mpe_count_ksd_mill,
            mpe_plus_plan_total: mpe_plus_plan_count_ksd_mill,
          },
          RO_KALTIM: {
            mpp_total: mpp_count_ro_kaltim,
            mpe_total: mpe_count_ro_kaltim,
            mpe_plus_plan_total: mpe_plus_plan_count_ro_kaltim,
          },
        },
      ],
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
  }

  if (filter[1] == "KALTIM II") {
    const mpp_count_hpm = totalCount.filter(
      (item) => item.mpp === "1" && item.location_description == "HPM"
    ).length;
    const mpp_count_hpm_mill = totalCount.filter(
      (item) => item.mpp === "1" && item.location_description == "HPM - MILL"
    ).length;
    const mpp_count_hpm_trading = totalCount.filter(
      (item) => item.mpp === "1" && item.location_description == "HPM - TRADING"
    ).length;
    const mpp_count_kam = totalCount.filter(
      (item) => item.mpp === "1" && item.location_description == "KAM"
    ).length;
    const mpp_count_ksd_trading = totalCount.filter(
      (item) => item.mpp === "1" && item.location_description == "KSD - TRADING"
    ).length;
    const mpp_count_pta = totalCount.filter(
      (item) => item.mpp === "1" && item.location_description == "PTA"
    ).length;
    const mpp_count_sawa = totalCount.filter(
      (item) => item.mpp === "1" && item.location_description == "SAWA"
    ).length;
    const mpp_count_sle = totalCount.filter(
      (item) => item.mpp === "1" && item.location_description == "SLE"
    ).length;
    const mpp_count_sle_mill = totalCount.filter(
      (item) => item.mpp === "1" && item.location_description == "SLE - MILL"
    ).length;
    const mpp_count_sle_trading = totalCount.filter(
      (item) => item.mpp === "1" && item.location_description == "SLE - TRADING"
    ).length;

    const mpe_count_hpm = totalCount.filter(
      (item) => item.mpe === "1" && item.location_description == "HPM"
    ).length;
    const mpe_count_hpm_mill = totalCount.filter(
      (item) => item.mpe === "1" && item.location_description == "HPM - MILL"
    ).length;
    const mpe_count_hpm_trading = totalCount.filter(
      (item) => item.mpe === "1" && item.location_description == "HPM - TRADING"
    ).length;
    const mpe_count_kam = totalCount.filter(
      (item) => item.mpe === "1" && item.location_description == "KAM"
    ).length;
    const mpe_count_ksd_trading = totalCount.filter(
      (item) => item.mpe === "1" && item.location_description == "KSD - TRADING"
    ).length;
    const mpe_count_pta = totalCount.filter(
      (item) => item.mpe === "1" && item.location_description == "PTA"
    ).length;
    const mpe_count_sawa = totalCount.filter(
      (item) => item.mpe === "1" && item.location_description == "SAWA"
    ).length;
    const mpe_count_sle = totalCount.filter(
      (item) => item.mpe === "1" && item.location_description == "SLE"
    ).length;
    const mpe_count_sle_mill = totalCount.filter(
      (item) => item.mpe === "1" && item.location_description == "SLE - MILL"
    ).length;
    const mpe_count_sle_trading = totalCount.filter(
      (item) => item.mpe === "1" && item.location_description == "SLE - TRADING"
    ).length;

    const mpe_plus_plan_count_hpm = totalCount.filter(
      (item) => item.mpe_plus_plan === "1" && item.location_description == "HPM"
    ).length;
    const mpe_plus_plan_count_hpm_mill = totalCount.filter(
      (item) =>
        item.mpe_plus_plan === "1" && item.location_description == "HPM - MILL"
    ).length;
    const mpe_plus_plan_count_hpm_trading = totalCount.filter(
      (item) =>
        item.mpe_plus_plan === "1" &&
        item.location_description == "HPM - TRADING"
    ).length;
    const mpe_plus_plan_count_kam = totalCount.filter(
      (item) => item.mpe_plus_plan === "1" && item.location_description == "KAM"
    ).length;
    const mpe_plus_plan_count_ksd_trading = totalCount.filter(
      (item) =>
        item.mpe_plus_plan === "1" &&
        item.location_description == "KSD - TRADING"
    ).length;
    const mpe_plus_plan_count_pta = totalCount.filter(
      (item) => item.mpe_plus_plan === "1" && item.location_description == "PTA"
    ).length;
    const mpe_plus_plan_count_sawa = totalCount.filter(
      (item) =>
        item.mpe_plus_plan === "1" && item.location_description == "SAWA"
    ).length;
    const mpe_plus_plan_count_sle = totalCount.filter(
      (item) => item.mpe_plus_plan === "1" && item.location_description == "SLE"
    ).length;
    const mpe_plus_plan_count_sle_mill = totalCount.filter(
      (item) =>
        item.mpe_plus_plan === "1" && item.location_description == "SLE - MILL"
    ).length;
    const mpe_plus_plan_count_sle_trading = totalCount.filter(
      (item) =>
        item.mpe_plus_plan === "1" &&
        item.location_description == "SLE - TRADING"
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
    return {
      filter: [
        {
          HPM: {
            mpp_total: mpp_count_hpm,
            mpe_total: mpe_count_hpm,
            mpe_plus_plan_total: mpe_plus_plan_count_hpm,
          },
          HPM_MILL: {
            mpp_total: mpp_count_hpm_mill,
            mpe_total: mpe_count_hpm_mill,
            mpe_plus_plan_total: mpe_plus_plan_count_hpm_mill,
          },
          HPM_TRADING: {
            mpp_total: mpp_count_hpm_trading,
            mpe_total: mpe_count_hpm_trading,
            mpe_plus_plan_total: mpe_plus_plan_count_hpm_trading,
          },
          KAM: {
            mpp_total: mpp_count_kam,
            mpe_total: mpe_count_kam,
            mpe_plus_plan_total: mpe_plus_plan_count_kam,
          },
          KSD_TRADING: {
            mpp_total: mpp_count_ksd_trading,
            mpe_total: mpe_count_ksd_trading,
            mpe_plus_plan_total: mpe_plus_plan_count_ksd_trading,
          },
          PTA: {
            mpp_total: mpp_count_pta,
            mpe_total: mpe_count_pta,
            mpe_plus_plan_total: mpe_plus_plan_count_pta,
          },
          SAWA: {
            mpp_total: mpp_count_sawa,
            mpe_total: mpe_count_sawa,
            mpe_plus_plan_total: mpe_plus_plan_count_sawa,
          },
          SLE: {
            mpp_total: mpp_count_sle,
            mpe_total: mpe_count_sle,
            mpe_plus_plan_total: mpe_plus_plan_count_sle,
          },
          SLE_MILL: {
            mpp_total: mpp_count_sle_mill,
            mpe_total: mpe_count_sle_mill,
            mpe_plus_plan_total: mpe_plus_plan_count_sle_mill,
          },
          SLE_TRADING: {
            mpp_total: mpp_count_sle_trading,
            mpe_total: mpe_count_sle_trading,
            mpe_plus_plan_total: mpe_plus_plan_count_sle_trading,
          },
        },
      ],
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
  }

  if (filter[1] == "KALTIM III") {
    const mpp_count_aapa = totalCount.filter(
      (item) => item.mpp === "1" && item.location_description == "AAPA"
    ).length;
    const mpp_count_aapa_mill = totalCount.filter(
      (item) => item.mpp === "1" && item.location_description == "AAPA - MILL"
    ).length;
    const mpp_count_aapa_trading = totalCount.filter(
      (item) =>
        item.mpp === "1" && item.location_description == "AAPA - TRADING"
    ).length;
    const mpp_count_gas = totalCount.filter(
      (item) => item.mpp === "1" && item.location_description == "GAS"
    ).length;
    const mpp_count_ho_npm = totalCount.filter(
      (item) =>
        item.mpp === "1" && item.location_description == "HEAD OFFICE - NPM"
    ).length;
    const mpp_count_npn = totalCount.filter(
      (item) => item.mpp === "1" && item.location_description == "NPN"
    ).length;
    const mpp_count_npn_mill = totalCount.filter(
      (item) => item.mpp === "1" && item.location_description == "NPN - MILL"
    ).length;
    const mpp_count_npn_trading = totalCount.filter(
      (item) => item.mpp === "1" && item.location_description == "NPN - TRADING"
    ).length;
    const mpp_count_ro_kaltim3 = totalCount.filter(
      (item) =>
        item.mpp === "1" &&
        item.location_description == "REGION - OFFICE KALTIM III"
    ).length;
    const mpp_count_ywa = totalCount.filter(
      (item) => item.mpp === "1" && item.location_description == "YWA"
    ).length;
    const mpp_count_ywa_mill = totalCount.filter(
      (item) => item.mpp === "1" && item.location_description == "YWA - MILL"
    ).length;
    const mpp_count_ywa_trading = totalCount.filter(
      (item) => item.mpp === "1" && item.location_description == "YWA TRADING"
    ).length;

    const mpe_count_aapa = totalCount.filter(
      (item) => item.mpe === "1" && item.location_description == "AAPA"
    ).length;
    const mpe_count_aapa_mill = totalCount.filter(
      (item) => item.mpe === "1" && item.location_description == "AAPA - MILL"
    ).length;
    const mpe_count_aapa_trading = totalCount.filter(
      (item) =>
        item.mpe === "1" && item.location_description == "AAPA - TRADING"
    ).length;
    const mpe_count_gas = totalCount.filter(
      (item) => item.mpe === "1" && item.location_description == "GAS"
    ).length;
    const mpe_count_ho_npm = totalCount.filter(
      (item) =>
        item.mpe === "1" && item.location_description == "HEAD OFFICE - NPM"
    ).length;
    const mpe_count_npn = totalCount.filter(
      (item) => item.mpe === "1" && item.location_description == "NPN"
    ).length;
    const mpe_count_npn_mill = totalCount.filter(
      (item) => item.mpe === "1" && item.location_description == "NPN - MILL"
    ).length;
    const mpe_count_npn_trading = totalCount.filter(
      (item) => item.mpe === "1" && item.location_description == "NPN - TRADING"
    ).length;
    const mpe_count_ro_kaltim3 = totalCount.filter(
      (item) =>
        item.mpe === "1" &&
        item.location_description == "REGION - OFFICE KALTIM III"
    ).length;
    const mpe_count_ywa = totalCount.filter(
      (item) => item.mpe === "1" && item.location_description == "YWA"
    ).length;
    const mpe_count_ywa_mill = totalCount.filter(
      (item) => item.mpe === "1" && item.location_description == "YWA - MILL"
    ).length;
    const mpe_count_ywa_trading = totalCount.filter(
      (item) => item.mpe === "1" && item.location_description == "YWA TRADING"
    ).length;

    const mpe_plus_plan_count_aapa = totalCount.filter(
      (item) =>
        item.mpe_plus_plan === "1" && item.location_description == "AAPA"
    ).length;
    const mpe_plus_plan_count_aapa_mill = totalCount.filter(
      (item) =>
        item.mpe_plus_plan === "1" && item.location_description == "AAPA - MILL"
    ).length;
    const mpe_plus_plan_count_aapa_trading = totalCount.filter(
      (item) =>
        item.mpe_plus_plan === "1" &&
        item.location_description == "AAPA - TRADING"
    ).length;
    const mpe_plus_plan_count_gas = totalCount.filter(
      (item) => item.mpe_plus_plan === "1" && item.location_description == "GAS"
    ).length;
    const mpe_plus_plan_count_ho_npm = totalCount.filter(
      (item) =>
        item.mpe_plus_plan === "1" &&
        item.location_description == "HEAD OFFICE - NPM"
    ).length;
    const mpe_plus_plan_count_npn = totalCount.filter(
      (item) => item.mpe_plus_plan === "1" && item.location_description == "NPN"
    ).length;
    const mpe_plus_plan_count_npn_mill = totalCount.filter(
      (item) =>
        item.mpe_plus_plan === "1" && item.location_description == "NPN - MILL"
    ).length;
    const mpe_plus_plan_count_npn_trading = totalCount.filter(
      (item) =>
        item.mpe_plus_plan === "1" &&
        item.location_description == "NPN - TRADING"
    ).length;
    const mpe_plus_plan_count_ro_kaltim3 = totalCount.filter(
      (item) =>
        item.mpe_plus_plan === "1" &&
        item.location_description == "REGION - OFFICE KALTIM III"
    ).length;
    const mpe_plus_plan_count_ywa = totalCount.filter(
      (item) => item.mpe_plus_plan === "1" && item.location_description == "YWA"
    ).length;
    const mpe_plus_plan_count_ywa_mill = totalCount.filter(
      (item) =>
        item.mpe_plus_plan === "1" && item.location_description == "YWA - MILL"
    ).length;
    const mpe_plus_plan_count_ywa_trading = totalCount.filter(
      (item) =>
        item.mpe_plus_plan === "1" && item.location_description == "YWA TRADING"
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
    return {
      filter: [
        {
          AAPA: {
            mpp_total: mpp_count_aapa,
            mpe_total: mpe_count_aapa,
            mpe_plus_plan_total: mpe_plus_plan_count_aapa,
          },
          AAPA_MILL: {
            mpp_total: mpp_count_aapa_mill,
            mpe_total: mpe_count_aapa_mill,
            mpe_plus_plan_total: mpe_plus_plan_count_aapa_mill,
          },
          AAPA_TRADING: {
            mpp_total: mpp_count_aapa_trading,
            mpe_total: mpe_count_aapa_trading,
            mpe_plus_plan_total: mpe_plus_plan_count_aapa_trading,
          },
          GAS: {
            mpp_total: mpp_count_gas,
            mpe_total: mpe_count_gas,
            mpe_plus_plan_total: mpe_plus_plan_count_gas,
          },
          HO_NPM: {
            mpp_total: mpp_count_ho_npm,
            mpe_total: mpe_count_ho_npm,
            mpe_plus_plan_total: mpe_plus_plan_count_ho_npm,
          },
          NPN: {
            mpp_total: mpp_count_npn,
            mpe_total: mpe_count_npn,
            mpe_plus_plan_total: mpe_plus_plan_count_npn,
          },
          NPN_MILL: {
            mpp_total: mpp_count_npn_mill,
            mpe_total: mpe_count_npn_mill,
            mpe_plus_plan_total: mpe_plus_plan_count_npn_mill,
          },
          NPN_TRADING: {
            mpp_total: mpp_count_npn_trading,
            mpe_total: mpe_count_npn_trading,
            mpe_plus_plan_total: mpe_plus_plan_count_npn_trading,
          },
          RO_KALTIM_III: {
            mpp_total: mpp_count_ro_kaltim3,
            mpe_total: mpe_count_ro_kaltim3,
            mpe_plus_plan_total: mpe_plus_plan_count_ro_kaltim3,
          },
          YWA: {
            mpp_total: mpp_count_ywa,
            mpe_total: mpe_count_ywa,
            mpe_plus_plan_total: mpe_plus_plan_count_ywa,
          },
          YWA_MILL: {
            mpp_total: mpp_count_ywa_mill,
            mpe_total: mpe_count_ywa_mill,
            mpe_plus_plan_total: mpe_plus_plan_count_ywa_mill,
          },
          YWA_TRADING: {
            mpp_total: mpp_count_ywa_trading,
            mpe_total: mpe_count_ywa_trading,
            mpe_plus_plan_total: mpe_plus_plan_count_ywa_trading,
          },
        },
      ],
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
  }

  if (filter[1] == "HEAD OFFICE") {
    const divisions = [
      "OPERATIONAL DEVELOPMENT & MECHANIZATION DIVISION",
      "MILL DEVELOPMENT DIVISION",
      "TRADING & LOGISTIC DIVISION",
      "RESTORATION AND CARBON TRADING DIVISION",
      "IT & BP DIVISION",
      "COMMERCIAL FFB DIVISION",
      "INFRASTRUCTURE & WORKSHOP DIVISION",
      "REGION - SUMATERA",
      "ESTATE DIRECTORATE",
      "MILL DIRECTORATE",
      "EXTERNAL RELATION PROJECT DIVISION",
      "EXTERNAL RELATION DIVISION",
      "HC OPERATION DIVISION",
      "TAX DIVISION",
      "CORPORATE SECRETARY DIRECTORATE",
      "HC DEVELOPMENT DIVISION",
      "DOC., LICENSE & CSR DIVISION - KALTIM",
      "CEO",
      "SURVEY DIVISION",
      "REGION - KALTIM III",
      "FINANCE DIRECTORATE",
      "PROCUREMENT DIVISION",
      "EXTERNAL RELATION DIRECTORATE",
      "CORPORATE AUDIT DIVISION",
      "REGION - KALTIM",
      "HUMAN CAPITAL DIRECTORATE",
      "OPERATION DIRECTORATE",
      "GOVERNMENT & ASSOCIATION DIVISION",
      "RESEARCH & DEVELOPMENT DIVISION",
      "MILL OPERATION DIVISION",
      "CSR, PLASMA & DOC. LIC. DIVISION - KALTENG & SUMATERA",
      "ACCOUNTING & BUDGET DIVISION",
      "SUSTAINABILITY, TRADING & DOWNSTREAM DIRECTORATE",
      "CORPORATE FINANCE & FUNDING DIRECTORATE",
      "PLANTATION CONTROLLER DIVISION",
      "SUSTAINABILITY DIVISION",
      "CPO DIVISION",
      "HC EXCELLENCE CENTER DIVISION",
      "SUSTAINABILITY DIRECTORATE",
      "IT & BP DIRECTORATE",
      "REGION - KALTENG",
      "FFB SOURCING DIVISION",
      "FINANCE DIVISION",
      "MARKETING DIRECTORATE"
  ]

  const filter = divisions.map(division => {
    const key = division.replace(/[\s&-]+/g, '_'); // Replace spaces with underscores
    const mppCount = totalCount.filter(item => item.mpp === "1" && item.division_description === division).length;
    const mpeCount = totalCount.filter(item => item.mpe === "1" && item.division_description === division).length;
    const mpePlusPlanCount = totalCount.filter(item => item.mpe_plus_plan === "1" && item.division_description === division).length;
  
    return {
      [key]: {
        mpp_total: mppCount,
        mpe_total: mpeCount,
        mpe_plus_plan_total: mpePlusPlanCount,
      },
    };
  });

  const result = {
    filter,
    fulfill: 0,
    vacant: 0,
    closed: 0,
    over_mpp: 0,
    fptk_over_mpp: 0,
    employees: rows,
    page_size: rows.length,
    total_data: count,
    current_page: page,
    max_page: Math.ceil(count / limit),
  };

  result.fulfill = totalCount.filter(item => item.status_plan_fulfillment === "FULFILL").length;
  result.vacant = totalCount.filter(item => item.status_plan_fulfillment === "VACANT").length;
  result.closed = totalCount.filter(item => item.status_plan_fulfillment === "CLOSED").length;
  result.over_mpp = totalCount.filter(item => item.status_plan_fulfillment === "OVER MPP").length;
  result.fptk_over_mpp = totalCount.filter(item => item.status_plan_fulfillment === "FPTK OVER MPP").length;

  return result;
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

  return {
    filter: {},
    mpp_total: mpp_count,
    mpe_total: mpe_count,
    mpe_plus_plan_total: mpe_plus_plan_count,
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
