const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");
const httpStatus = require("http-status");
const ApiError = require("../utils/ApiError");
const validator = require("validator");
const dotenv = require("dotenv");

const { Users, Roles } = require("../models");

dotenv.config();

const hashPassword = async (password) => {
  const salt = await bcryptjs.genSalt(10);
  const hashedPassword = await bcryptjs.hash(password, salt);
  return hashedPassword;
};

const comparePassword = async (password, hashedPassword) => {
  const isPasswordMatch = await bcryptjs.compare(password, hashedPassword);
  return isPasswordMatch;
};

const generateToken = (user) => {
  return jwt.sign(
    {
      user_id: user.id,
      role_id: user.role_id,
    },
    process.env.JWT_SECRET
  );
};

const login = async (reqBody) => {
  const { email, password } = reqBody;

  if (!email || !password) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Empty data. Please fill the form");
  }
  const user = await Users.findOne({
    where: {
      email,
    },
    include: {
      model: Roles,
    },
  });

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User Not Found");
  }

  const isPasswordValid = await comparePassword(password, user.password);

  if (!isPasswordValid) {
    throw new ApiError(httpStatus.FORBIDDEN, "Invalid email and password combination");
  }

  const payloadToken = {
    id: user.id,
    role_id: user.role_id,
  };

  const accessToken = generateToken(payloadToken);

  try {
    decoded = await jwt.verify(accessToken, process.env.JWT_SECRET);
  } catch (err) {
    res.status(401).json({
      status: 401,
      message: "Invalid token",
      error: err.message,
    });
  }

  const currentUser = await Users.findByPk(decoded.user_id);

  const token = {
    access_token: accessToken,
    user_id: currentUser.id,
    role_id: currentUser.role_id,
  };

  return token;
};

const register = async (reqBody) => {
  const { full_name, email, password, confirm_password } = reqBody;

  if (!full_name || !email || !password) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Empty data. Please fill the form");
  }

  if (!validator.isEmail(email)) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Email is not valid");
  }

  const findEmail = await Users.findOne({
    where: {
      email,
    },
  });

  if (findEmail) {
    throw new ApiError(httpStatus.CONFLICT, "Email is already registered");
  }

  if (password != confirm_password) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Confirm password must be the same as password");
  }

  const passswordLength = password.length >= 8;
  if (!passswordLength) {
    throw new ApiError(httpStatus.BAD_REQUEST, "minimum password length must be 8 charater or more");
  }

  const hash = await hashPassword(password);

  const user = {
    full_name,
    email,
    password: hash,
  };

  await Users.create(user);
};

module.exports = { login, register };
