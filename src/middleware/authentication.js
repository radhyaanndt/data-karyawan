const jwt = require("jsonwebtoken");
const { Users } = require("../models")

exports.authentication = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return next(
      res.status(401).json({
        status: 401,
        message: "Unauthorized",
      })
    );
  }

  let decoded;

  try {
    decoded = await jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    return next(
      res.status(401).json({
        status: 401,
        message: "Invalid token",
        error: err.message,
      })
    );
  }
  
  const currentUser = await Users.findByPk(decoded.user_id)

  // console.log(currentUser);

  next();
};
