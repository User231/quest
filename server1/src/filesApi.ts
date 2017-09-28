import express = require("express");
import multer = require("multer");
import path = require("path");
import fs = require("fs");
import uuidv4 = require("uuid/v4");


let router = express.Router();
export = router;

router.post("/", (req, res, next) => {
  
  let destPath = path.join(__dirname, "../src/public/uploads/");
  let upload = multer({ dest: destPath }).single("file");
  upload(req, null, err => {
    if (err)
      return next(err);
    if (!req.file)
      return next(new Error("Error uploading file"));
    let targetFileName = uuidv4() + path.extname(req.file.originalname);
    fs.rename(path.join(destPath, req.file.filename), path.join(destPath, targetFileName), err => {
      if (err)
        return next(err);
      res.status(200);
      res.send(targetFileName);
    });
  });
});

router.use((err: Error, req, res, next) => {
  console.log(err)
  res.status(500).json({
    ok: false,
    error: err
  })
});
