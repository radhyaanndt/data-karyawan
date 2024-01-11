const express = require("express");
const fs = require("fs-extra");
const dotenv = require("dotenv");
const cors = require("cors")
const router = require("./routes/router");

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors())
app.use(express.json());
app.use(router);

app.get("/", (req, res) => {
  return res.status(200).send({
    Response: `Welcome to ${process.env.APP_NAME} API`,
  });
});

app.listen(port, "0.0.0.0", function () {
  console.log(`${process.env.APP_NAME} running on port ${process.env.APP_PORT}`);
});

module.exports = app;
