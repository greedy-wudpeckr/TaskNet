const express = require("express");
const app = express();
const methodOverride = require("method-override");
const path = require("path");
const { userModel } = require("./database/db");
const session = require("express-session");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const UserRouter = require("./routes/users");
require('dotenv').config();

app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "/public")));
app.set("views", path.join(__dirname, "views"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));

// Configure session options
const sessionOptions = {
  secret: "My name is Mudit",
  resave: false,
  saveUninitialized: true,
  cookie: {
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000, // Expires in 7 days
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true, // Prevent cross-scripting attacks
  },
};

app.use(session(sessionOptions));
app.use(passport.initialize());
app.use(passport.session()); // Correct middleware order

// Configure Passport.js with user model
passport.use(new LocalStrategy(userModel.authenticate())); 
passport.serializeUser(userModel.serializeUser()); 
passport.deserializeUser(userModel.deserializeUser()); 

// Use the user routes
app.use("/user", UserRouter);

// Define main routes
app.get("/home", (req, res) => {
  res.render("./page/home.ejs");
});


app.listen(8080, () => {
  console.log("Server is listening on port 8080");
});
