const express = require("express");
const multer = require("multer");
const port = 5000;
const App = express();

App.set("view engine", "ejs");
App.use(express.static(__dirname + "/public"));

const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, "public/uploads");
  },
  filename: (req, file, callback) => {
    var ext = file.originalname.split(".");
    ext = ext[ext.length - 1].toLowerCase();
    const newFileName = req.body.title + " " + Date.now() + "." + ext;
    callback(null, newFileName);
  },
});
const upload = multer({ storage: storage });

App.get("/", (req, res) => {
  res.render("index", { success: req.query.success });
});

App.post("/upload", upload.array("doc"), (req, res) => {
  res.redirect("/?success=true");
});

App.listen(port, () => {
  console.log(
    `Server Listening on port ${port}\nGo to : http://localhost:${port}/`
  );
});
