const express = require("express");
const dotenv = require("dotenv");
const router = require("./routes/router");

dotenv.config();

const app = express();

app.use(express.json());
app.use(router);

app.get("/", (req, res) => {
  return res.status(200).send({
    Response: `Welcome to ${process.env.APP_NAME} API`,
  });
});

app.listen(process.env.APP_PORT, () => {
  console.log(`${process.env.APP_NAME} running on port ${process.env.APP_PORT}`);
});

module.exports = app;
