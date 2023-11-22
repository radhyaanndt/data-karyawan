"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Employee_data", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      nik: {
        type: Sequelize.STRING,
      },
      name: {
        type: Sequelize.STRING,
      },
      hire_date: {
        type: Sequelize.STRING,
      },
      length_of_service: {
        type: Sequelize.STRING,
      },
      position_description: {
        type: Sequelize.STRING,
      },
      start_position: {
        type: Sequelize.STRING,
      },
      length_of_position: {
        type: Sequelize.STRING,
      },
      mgr_level_description: {
        type: Sequelize.STRING,
      },
      mpp: {
        type: Sequelize.STRING,
      },
      mpe: {
        type: Sequelize.STRING,
      },
      mpe_vs_mpp: {
        type: Sequelize.STRING,
      },
      status: {
        type: Sequelize.STRING,
      },
      group: {
        type: Sequelize.STRING,
      },
      departmen_description: {
        type: Sequelize.STRING,
      },
      division_description: {
        type: Sequelize.STRING,
      },
      directorat_description: {
        type: Sequelize.STRING,
      },
      location_description: {
        type: Sequelize.STRING,
      },
      regional: {
        type: Sequelize.STRING,
      },
      business_unit_description: {
        type: Sequelize.STRING,
      },
      plan_fulfillment: {
        type: Sequelize.STRING,
      },
      detail_plan_fulfillment: {
        type: Sequelize.STRING,
      },
      nik_plan: {
        type: Sequelize.STRING,
      },
      nama_karyawan_plan_fulfillment: {
        type: Sequelize.STRING,
      },
      mpe_plus_plan: {
        type: Sequelize.STRING,
      },
      status_plan_fulfillment: {
        type: Sequelize.STRING,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      deletedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("Employee_data");
  },
};
