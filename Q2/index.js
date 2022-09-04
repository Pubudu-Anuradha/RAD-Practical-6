const express = require("express");
const multer = require("multer");
const mongoose = require("mongoose");

const port = 4000;

const App = express();
App.set("view engine", "ejs");
App.use(express.static(__dirname + "/public"));
App.use(express.json());
App.use(express.urlencoded({ extended: false }));

mongoose.connect("mongodb://localhost:27017/photogallery", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const ImageSchema = new mongoose.Schema({
  filename: {
    type: String,
    required: true,
  },
  caption: {
    type: String,
    required: true,
  },
});

const Image = mongoose.model("Image", ImageSchema);

const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, "public/uploads");
  },
  filename: (req, file, callback) => {
    var ext = file.originalname.split(".");
    ext = ext[ext.length - 1].toLowerCase();

    const newFileName = Date.now() + "." + ext;

    const record = new Image({
      filename: newFileName,
      caption: req.body.caption,
    });

    record.save();
    callback(null, newFileName);
  },
});

const upload = multer({ storage: storage });

App.get("/", (req, res) => {
  Image.find({}, (err, result) => {
    if (err) {
      throw err;
    }
    res.render("index", { pics: result });
  });
});

App.post("/upload", upload.single("pic"), (req, res) => {
  res.redirect("/");
});

App.listen(port, () => {
  console.log(
    `Server Listening on port ${port}\nGo to : http://localhost:${port}/`
  );
});
