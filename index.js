const express = require("express");
const app = express();
const methodOverride = require("method-override");
const path = require("path");
const {userModel} = require("./database/db");
const toDoModel = require("./database/db");
const session = require("express-session");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const bcrypt = require('bcrypt');
const UserRouter = require("./routes/users");
require('dotenv').config();
const databaseKey = process.env.DATABASEKEY;

app.set("view engine","ejs");
app.use(express.static(path.join(__dirname,"/public")));
app.set("views",path.join(__dirname,"views"));
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(methodOverride("_method"));

const sessionOptions = {
    secret : "My name is Mudit",
    resave: false,
    saveUninitialized:true,
    cookie:{
      expires : Date.now() + 7*24*60*60*1000, // expire date 7 day 
      maxAge : 7*24*60*60*1000,
      httpOnly : true, // to prevent crossScripting attacks  
    }
  };

app.use(session(sessionOptions));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(userModel.authenticate));
passport.serializeUser(userModel.serializeUser()); // to store info regarding the user
passport.deserializeUser(userModel.deserializeUser()); // to destrore the info regarding the user 


app.use("/user",UserRouter);

app.listen("8080", () => {
    console.log("Server is listening on port 8080");
  });

app.get("/home",(req,res)=>{
    res.render("./page/home.ejs");
})

app.post("/login", passport.authenticate("local", {
    failureRedirect: "/login",
    failureFlash: true,
  }),(req, res) => {
    res.redirect("/user/profile");
  });






