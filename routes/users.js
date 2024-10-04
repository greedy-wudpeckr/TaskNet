const { Router } = require("express");
const wrapAsync = require("../utils/wrapAsync");
const { userModel, toDoModel } = require("../database/db");
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

// Proper Login Route Implementation
UserRouter.post(
  "/login",
  passport.authenticate("local", {
    failureRedirect: "/user/login", // Redirect to login page on failure
    // failureFlash: true,             // Enable flash messages on failure
  }),
  (req, res) => {
    res.redirect("/user/profile");  // Redirect to profile on success
  }
);

// logout route 

UserRouter.post("/logout",(req,res,next)=>{
  req.logout((err)=>{
      if(err){
          next(err);
      }
      res.redirect("/home");
  });
  });
  

//--------------------------------------------------

// User profile route (requires authentication)
UserRouter.get("/profile", isLoggedIn,async (req, res) => {
  const userId = req.user._id; // Correctly access the user ID
  const username = await userModel.findById(userId);
  console.log("Current User ID:", userId);
  res.render("./page/toDo-Page/home.ejs", { user: username }); // Render the profile page and pass user info
});

// Render Create Todo page (requires authentication)
UserRouter.get("/createTodo", isLoggedIn, (req, res) => {
  res.render("./page/toDo-Page/create.ejs");
});

// Create a new Todo (requires authentication)
UserRouter.post("/createTodo", isLoggedIn, async (req, res) => {
  try {
    // Capture the task from the request body
    const  task  = req.body.task;
    const userId = req.user._id;

    // if (!task || task.trim() === "") {
    //   // Check if task is provided and is not an empty string
    //   return res.status(400).send("Task cannot be empty.");
    // }

    // Create the new todo item
    await toDoModel.create({
      userId: userId,
      task: task,
      completed: false,
      createdAt: Date.now(),
    });

    res.redirect("/user/getTodos");
  } catch (error) {
    console.error("Error creating todo:", error);
    res.status(500).send("Internal Server Error");
  }
});


// Get all Todos for the logged-in user (requires authentication)
UserRouter.get("/getTodos", isLoggedIn, async (req, res) => {
  const userId = req.user._id;
  const username = req.username;

  // Use `await` to properly retrieve the todos from MongoDB
  const data = await toDoModel.find({ userId: userId });

  console.log("Todos for User:", data);

  // Render the EJS template and pass the retrieved data
  res.render("./page/toDo-Page/todos.ejs", { data});
});


////////   Edit ----- Delete ----- Todo routes ////////

UserRouter.patch("/completeTodo/:id",isLoggedIn,async(req,res)=>{
  let id = req.params.id;
  await toDoModel.findByIdAndUpdate(id , {
    completed :true
  })
  res.redirect("/user/getTodos");
});

UserRouter.get("/editTodo/:id",isLoggedIn,async(req,res)=>{
  let id = req.params.id;
  let data = await toDoModel.findById(id);
  res.render("./page/toDo-Page/edit.ejs",{data});
})

UserRouter.patch("/editTodo/:id",isLoggedIn,async(req,res)=>{
  let id = req.params.id;
  let task = req.body.task;
  await toDoModel.findByIdAndUpdate(id , {
    task : task
  })
  res.redirect("/user/getTodos");
});


UserRouter.delete("/deleteTodo/:id",isLoggedIn,async(req,res)=>{
  let id = req.params.id;
  await toDoModel.findByIdAndDelete(id);
  res.redirect("/user/getTodos")
})


module.exports = UserRouter;
