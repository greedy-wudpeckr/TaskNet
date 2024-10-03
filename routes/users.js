const { Router } = require("express");
const wrapAsync = require("../utils/wrapAsync");
const { userModel } = require("../database/db");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const { isLoggedIn } = require("../utils/loginCheck");

const UserRouter = Router();

// Correctly set up the Passport strategy with `userModel.authenticate()` method
passport.use(new LocalStrategy(userModel.authenticate()));

// Passport serialization and deserialization
passport.serializeUser(userModel.serializeUser());
passport.deserializeUser(userModel.deserializeUser());

// Signup route
UserRouter.get("/signup", (req, res) => {
  res.render("./page/signup.ejs");
});

// Login route
UserRouter.get("/login", (req, res) => {
  res.render("./page/login.ejs");
});

// User registration (Signup) route
UserRouter.post(
  "/signup",
  wrapAsync(async (req, res, next) => {
    try {
      let { username, email, password } = req.body;
      let newUser = new userModel({ username, email });
      let regtUser = await userModel.register(newUser, password);

      console.log(regtUser);
      req.login(regtUser, (err) => {
        if (err) {
          return next(err);
        }
        res.redirect("/user/profile");
      });
    } catch (error) {
      res.json({
        message: error,
      });
    }
  })
);


// UserRouter.post("/login", passport.authenticate("local", {
//     failureRedirect: "/home",
//     failureFlash: true,
//   }),(req, res) => {
//     res.redirect("/home");
//   });
  

// User profile route (requires authentication)
UserRouter.get("/profile", isLoggedIn, (req, res) => {
  const userId = req.user._id; // Correctly access the user ID
  console.log("Current User ID:", userId);
  res.render("./page/profile.ejs", { user: req.user }); // Render the profile page and pass user info
});

module.exports = UserRouter;
