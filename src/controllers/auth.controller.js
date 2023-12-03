const authService = require("../services/auth.service");

const login = async (req, res) => {
  try {
    const user = await authService.login(req.body);
    return res.status(200).send({
      status: 200,
      message: "OK",
      data: user,
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
};

const register = async (req, res) => {
  try {
    const user = await authService.register(req.body);

    return res.status(201).send({
      status: 201,
      message: "Created",
      data: user,
    });
  } catch (error) {
    if (error.name === "SequelizeValidationError") {
      const validationErrors = error.errors.map((err) => ({
        field: err.path,
        message: err.message,
      }));

      return res.status(400).json({
        status: 400,
        message: "Bad Request",
        errors: validationErrors,
      });
    } else {
      return res.status(500).send({
        status: 500,
        message: "Internal Server Error",
        errors: error.message,
      });
    }
  }
};

module.exports = { login, register };
