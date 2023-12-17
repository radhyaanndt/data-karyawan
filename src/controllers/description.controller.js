const DescriptionService = require('../services/description.service');
const { validationResult } = require('express-validator');
const httpStatus = require("http-status");
const ApiError = require("../utils/ApiError");

class DescriptionController {
  static async getAllDescriptions(req, res) {
    try {
      const descriptions = await DescriptionService.getAllDescriptions();
      return res.status(200).send({
        status: 200,
        message: "OK",
        data: descriptions,
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
  }

  static async getDescriptionById(req, res) {
    try {
      const { id } = req.params;
      const description = await DescriptionService.getDescriptionById(id);

      if (!description) {
        throw new ApiError(httpStatus.NOT_FOUND, "Not Found");
      }

      return res.status(200).send({
        status: 200,
        message: "OK",
        data: description,
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
  }

  static async createDescription(req, res) {
    try {
      const data = req.body;
      const description = await DescriptionService.createDescription(data);

      return res.status(200).send({
        status: 200,
        message: "OK",
        data: description,
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
  }

  static async updateDescription(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { id } = req.params;
      const updatedData = req.body;
      const description = await DescriptionService.updateDescription(id, updatedData);

      return res.status(200).send({
        status: 200,
        message: "OK",
        data: description,
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
  }

  static async deleteDescription(req, res) {
    try {
      const { id } = req.params;
      const description = await DescriptionService.deleteDescription(id);

      return res.status(200).send({
        status: 200,
        message: "OK",
        data: description,
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
  }
}

module.exports = DescriptionController;
