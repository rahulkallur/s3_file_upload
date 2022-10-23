const express = require("express");
const app = express();
const AWS = require("aws-sdk");
const multer = require("multer");
const storage = multer.memoryStorage();
const dotenv = require("dotenv");
const bodyParser = require("body-parser");
const cors = require("cors");

app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

app.use(bodyParser.json());
app.use(cors());


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

app.post("/api/file/getDownloadURL", (req, res) => {
  console.log("Req:",req.body)
  let fileName = req.body.fileName;
  let bucketName = req.body.bucketName;

  const signedUrlExpireSeconds = 24 * 3600;

  const url = s3Client.getSignedUrl("getObject", {
    Bucket: bucketName,
    Key: fileName,
    Expires: signedUrlExpireSeconds,
  });

  if (url) {
    let obj = {
      downloadURL: url,
    };
    res.status(200).send(obj);
  } else {
    res.status(409).send("File not found");
  }
});

app.listen(process.env.SERVER_PORT, () => {
  console.log("Listening at http://localhost:" + process.env.SERVER_PORT);
});
