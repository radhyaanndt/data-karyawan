"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Employee_data extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Employee_data.init(
    {
      nik: DataTypes.STRING,
      name: DataTypes.STRING,
      hire_date: DataTypes.STRING,
      length_of_service: DataTypes.STRING,
      position_description: DataTypes.STRING,
      start_position: DataTypes.STRING,
      length_of_position: DataTypes.STRING,
      mgr_level_description: DataTypes.STRING,
      mpp: DataTypes.STRING,
      mpe: DataTypes.STRING,
      mpe_vs_mpp: DataTypes.STRING,
      status: DataTypes.STRING,
      group: DataTypes.STRING,
      departmen_description: DataTypes.STRING,
      division_description: DataTypes.STRING,
      directorat_description: DataTypes.STRING,
      location_description: DataTypes.STRING,
      regional: DataTypes.STRING,
      business_unit_description: DataTypes.STRING,
      plan_fulfillment: DataTypes.STRING,
      detail_plan_fulfillment: DataTypes.STRING,
      nik_plan: DataTypes.STRING,
      nama_karyawan_plan_fulfillment: DataTypes.STRING,
      mpe_plus_plan: DataTypes.STRING,
      status_plan_fulfillment: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "Employee_data",
    }
  );
  return Employee_data;
};
