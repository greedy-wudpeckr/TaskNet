module.exports.isLoggedIn = (req,res,next)=>{
    console.log(req);
      if(!req.isAuthenticated()){
        //   req.flash("error","you must be logged in");
          return res.redirect("/user/login");
        }
        next();
  }