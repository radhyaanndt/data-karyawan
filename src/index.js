const express = require("express");
const multer = require("multer");
const excelToJson = require("convert-excel-to-json");
const fs = require("fs-extra");
const dotenv = require("dotenv");
const router = require("./routes/router");

dotenv.config();

const app = express();

app.use(express.json());
app.use(router);

var upload = multer({ dest: "uploads/" });

app.post("/read", upload.single("file"), (req, res) => {
  try {
    if (req.file.filename == null || req.file?.filename == "undefined") {
      res.status(400).json("no file uploaded");
    } else {
      var filePath = "uploads" + req.file.filename;

      const excelData = excelToJson({
        sourceFile: filePath,
        header: {
          rows: 1,
        },
        columnToKey: {
          "*": "{{columnHeader}}",
        },
      });

      fs.remove(filePath);

      res.status(200).json(excelData);
    }
  } catch (error) {
    res.status(500);
  }
});

app.get("/", (req, res) => {
  return res.status(200).send({
    Response: `Welcome to ${process.env.APP_NAME} API`,
  });
});

app.listen(process.env.APP_PORT, () => {
  console.log(`${process.env.APP_NAME} running on port ${process.env.APP_PORT}`);
});

module.exports = app;
