const httpStatus = require("http-status");
const ApiError = require("../utils/ApiError");
const { sequelize, Employee_data } = require("../models");

const getBusinessUnit = async () => {
    const data = await Employee_data.findAll({
      attributes: [[sequelize.fn("DISTINCT", sequelize.col("business_unit_description")), "business_unit_description"]],
    });

    return data
}

const getRegional = async () => {
  const data = await Employee_data.findAll({
    attributes: [[sequelize.fn("DISTINCT", sequelize.col("regional")), "regional"]],
  });

  return data;
};

const getGroup = async () => {
  const data = await Employee_data.findAll({
    attributes: [[sequelize.fn("DISTINCT", sequelize.col("group")), "group"]],
  });

  return data;
};

module.exports = { getBusinessUnit, getRegional, getGroup}