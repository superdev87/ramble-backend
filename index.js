const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
dotenv.config();
const indicative = require('indicative').validator;

const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const hpp = require("hpp");
const morgan = require("morgan");
const multer = require('multer');
const multerS3 = require('multer-s3');

const PORT = process.env.PORT || 8006;
const app = express();
const http = require("http");
const server = http.createServer(app);
const fs = require('fs');

const s3 = require('./controllers/s3Controller.js');
const { initializeSocket } = require("./socket.js");

const mongo_url =
  process.env.DEV_MODE == "true"
    ? process.env.MONGODB_URL_DEV
    : process.env.MONGODB_URL;

mongoose
  .connect(mongo_url)
  .then(() => console.log("DB connected to", mongo_url));

app.use(cors());
app.use(morgan("dev"));
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

//Data sanitization against NOSQL query injection and xss
app.use(mongoSanitize(), xss());

//Prevents parameter pollution
app.use(
  hpp({
    whitelist: [
      "duration",
      "ratingsQuantity",
      "ratingsAverage",
      "maxGroupSize",
      "difficulty",
      "price",
    ],
  })
);

// const storageConfig = multer.diskStorage({
//   destination: (req, file, cb) => {
//     // Ensure the directory exists or create it
//     const uploadDir = 'uploads';
//     fs.mkdirSync(uploadDir, { recursive: true });
//     cb(null, uploadDir);
//   },
//   filename: (req, file, cb) => {
//     cb(null, Date.now() + '-' + file.originalname);
//   },
// });

// const upload = multer({ storage: storageConfig });

// app.post('/upload', upload.single('file'), (req, res) => {
//   if (req.file) {
//     res.status(200).json({
//       message: 'File uploaded successfully',
//       filename: req.file.filename,
//       path: req.file.path
//     });
//   } else {
//     res.status(400).json({ message: 'No file uploaded', error: req.error || 'Unknown error' });
//   }
// });

// Configure multer-s3 to use as the storage engine
const upload = multer({
    storage: multerS3({
        s3: s3,
        bucket: process.env.S3_BUCKET_NAME,
        acl: 'public-read', // Adjust this according to your needs
        key: function (req, file, cb) {
            cb(null, Date.now().toString() + '-' + file?.originalname); // Use Date.now() to ensure unique filenames
        }
    })
});


// Upload route
app.post('/upload', upload.single('file'), (req, res) => {
  if (req.file) {
    res.send({
      success: true,
      message: 'File uploaded!',
      filename: req.file.location,
      path: req.file.path
    });
  } else {
      res.status(400).json({ message: 'No file uploaded', error: req.error || 'Unknown error' });
  }
});

app.use("/multimedia", express.static(__dirname + "/uploads"));

app.use('/admin', require("./routes/admin"));
app.use("/api/v1", require("./routes/api-router"));

// Use the initializeSocket function to set up Socket.IO
const io = initializeSocket(server);

server.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
// app.listen(PORT, () => console.log(`The server is running on PORT ${PORT}`));
  