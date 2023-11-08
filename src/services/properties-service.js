const httpStatus = require("http-status");
const ApiError = require("../utils/ApiError");
const { sequelize, Employee_data } = require("../models");

const getBusinessUnit = async () => {
    const data = await Employee_data.findAll({
      attributes: [[sequelize.fn("DISTINCT", sequelize.col("business_unit_description")), "business_unit_description"]],
    });

    return data
}

module.exports = { getBusinessUnit }