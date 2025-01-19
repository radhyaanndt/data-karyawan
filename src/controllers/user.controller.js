const { validationResult } = require("express-validator");
const httpStatus = require("http-status");
const ApiError = require("../utils/ApiError");
const UserService = require("../services/user.service");

class UserController {
    static async getAll(req, res) {
        const limit = parseInt(req.query.limit) || 10;
        const page = parseInt(req.query.page) || 1;
        const search = req.query.search || "";
        const filter = req.query.role_id ? { role_id: req.query.role_id } : null;
      
        try {
          const users = await UserService.getAll(limit, page, search, filter);
      
          return res.status(200).send({
            status: 200,
            message: "OK",
            data: users,
          });
        } catch (error) {
          return res.status(500).send({
            status: 500,
            message: "Internal Server Error",
            errors: error.message,
          });
        }
      }
      

    static async delete(req, res) {
      try {
        const { id } = req.params;
        const user = await UserService.delete(id);

        return res.status(200).send({
          status: 200,
          message: "OK",
          data: null,
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

module.exports = UserController;
