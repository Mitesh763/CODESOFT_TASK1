module.exports.isLoggedin =  (req,res,next) => {
    if(!req.isAuthenticated()){
        req.flash("err","sign-in Must required");
        res.redirect("/login");
    }
    next();
}