const express = require("express");
const app = express();
const AWS = require("aws-sdk");
const multer = require("multer");
const storage = multer.memoryStorage();
const dotenv = require("dotenv");
dotenv.config();
const upload = multer({ storage: storage });

const s3Client = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_KEY,
  region: process.env.AWS_REGION,
});

const uploadParams = {
  Bucket: process.env.BUCKET_NAME,
  Key: "", // pass key
  Body: null, // pass file body
};

app.post("/api/file/upload", upload.single("file"), (req, res) => {
  const params = uploadParams;

  uploadParams.Key = req.file.originalname;
  uploadParams.Body = req.file.buffer;

  s3Client.upload(params, (err, data) => {
    if (err) {
      res.status(500).json({ error: "Error -> " + err });
    }
    res.json({
      message: "File uploaded successfully",
      filename: req.file.originalname,
      location: data.Location,
    });
  });
});

app.listen(process.env.SERVER_PORT, () => {
  console.log("Listening at http://localhost:" + process.env.SERVER_PORT);
});
