const express = require("express");

const authController = require("../controllers/auth.controller");
const UserController = require("../controllers/user.controller");

const router = express.Router();

router.post("/login", authController.login);
router.post("/register", authController.register);
router.get("/get", UserController.getAll)

module.exports = router