const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const saltRounds = 12;
const crypto = require("crypto");
const User = require("../models/User");

router.use(function (req, res, next) {
  console.log(`${req.method} ${req.url} ${new Date()}`);
  next();
});

router.use((req, res, next) => {
  if (req.session.username) {
    res.locals.loggedIn = true;
    res.locals.username = req.session.username;
    res.locals.user = req.session.user;
  } else {
    res.locals.loggedIn = false;
    res.locals.username = null;
    res.locals.user = null;
  }
  next();
});

router.get("/login", (req, res) => {
  // console.log("ahello")
  res.render("login");
});
router.get("/signup", (req, res) => {
  res.render("signup");
});

router.post("/login", async (req, res, next) => {
  try {
    const { username, passphrase } = req.body;
    const hash = crypto.createHash("sha256");
    hash.update(passphrase);
    const encrypted = hash.digest("hex");
    const user = await User.findOne({
      username: username,
      passphrase: encrypted,
    });

    if (user) {
      req.session.username = username; //req.body
      req.session.user = user;
      res.redirect("/");
    } else {
      req.session.username = null;
      req.session.user = user;
      res.redirect("/login");
    }
  } catch (e) {
    next(e);
  }
});

router.post("/signup", async (req, res, next) => {
  try {
    const { email, username, password } = req.body;
    if (password.length <= 3) {
      // res.send("username has already been taken, please go back and try another username")
      res.redirect("/signup");
    } else {
      // const encrypted = await bcrypt.hash(password, saltRounds);

      // check to make sure that username is not already taken!!
      const duplicates = await User.find({ username });

      if (duplicates.length > 0) {
        // it would be better to render a page with an error message instead of this plain text response
        res.send(
          "username has already been taken, please go back and try another username"
        );
      } else {
        // the username has not been taken so create a new user and store it in the database
        const user = new User({
          email: email,
          username: username,
          password: password,
        });

        await user.save();
        req.session.username = user.username;
        req.session.user = user;
        console.log(req.session.user);
        res.redirect("/");
      }
    }
  } catch (e) {
    next(e);
  }
});

router.get("/logout", (req, res) => {
  req.session.destroy();
  res.redirect("/");
});

module.exports = router;
