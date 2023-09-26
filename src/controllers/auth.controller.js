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
      return res.status(error.statusCode).send({
        status: error.statusCode,
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
    if (error) {
      return res.status(error.statusCode || 500).send({
        status: error.statusCode,
        message: "Internal Server Error",
        errors: error.message,
      });
    }
  }
};

module.exports = { login, register };
