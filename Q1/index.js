const express = require("express");
const session = require("express-session");
const passport = require("passport");
const mongoose = require("mongoose");
const localStrategy = require("passport-local");
const bcrypt = require("bcrypt");
const port = 3000;

const App = express();

mongoose
  .connect("mongodb://localhost:27017/rad6q1", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to Database");
  });

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  passwordHash: {
    type: String,
    required: true,
  },
});

const User = mongoose.model("User", userSchema);

App.set("view engine", "ejs");
App.use(express.static(__dirname + "/public"));
App.use(express.json());
App.use(express.urlencoded({ extended: false }));

App.use(
  session({
    secret: "thisisprobablyagreatsecret",
    resave: false,
    saveUninitialized: false,
  })
);

passport.serializeUser((user, callback) => {
  callback(null, user.id);
});

passport.deserializeUser((id, callback) => {
  User.findById(id, (err, user) => {
    callback(err, user);
  });
});

App.use(passport.initialize());
App.use(passport.session());

passport.use(
  "local",
  new localStrategy(
    { usernameField: "email", passwordField: "pwd" },
    (email, pwd, callback) => {
      User.findOne({ email: email }, (err, user) => {
        if (err) return callback(err);
        if (!user) {
          return callback(null, false);
        }
        bcrypt.compare(pwd, user.passwordHash, (err, result) => {
          if (err) return callback(err);
          if (result) return callback(null, user);
          return callback(null, false);
        });
      });
    }
  )
);

App.post(
  "/login/auth",
  passport.authenticate("local", {
    failureRedirect: "/login?error=true",
    successRedirect: "/",
  })
);

const isLoggedIn = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  } else {
    res.redirect("/login");
  }
};

const isLoggedOut = (req, res, next) => {
  if (!req.isAuthenticated()) {
    return next();
  } else {
    res.redirect("/");
  }
};

App.get("/", isLoggedIn, (req, res) => {
  res.render("index");
});

App.get("/login", isLoggedOut, (req, res) => {
  res.render("login", { err: req.query.error });
});

App.get("/register", isLoggedOut, (req, res) => {
  res.render("register", { err: req.query.error });
});

App.post("/logout", (req, res, next) => {
  req.logOut(() => {
    res.redirect("/login");
  });
});

App.post("/register", (req, res) => {
  User.findOne({ email: req.body.email }, (err, user) => {
    if (err) throw err;
    if (!user) {
      bcrypt.hash(req.body.pwd, 10, (err, hash) => {
        if (err) throw err;
        const newUser = new User({
          email: req.body.email,
          passwordHash: hash,
        });
        newUser.save();
        res.redirect("/login");
      });
    } else {
      res.redirect("/register?error=true");
    }
  });
});

App.listen(port, () => {
  console.log(
    `Server Listening on port ${port}\nGo to : http://localhost:${port}/`
  );
});
