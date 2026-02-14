const express = require("express");
const router = express.Router();
const User=require("../models/user.js");
const wrapAsync = require("../utils/wrapAsync");
const passport=require("passport");
const { saveRedirectUrl } = require("../middleware.js");
const userController=require("../controllers/usesr.js");


router
    .route("/signup")
    .get(userController.renderSignupForm)
    .post(wrapAsync(userController.signup));

router
    .route("/login")
    .get(userController.renderLoginForm)
    .post(
        saveRedirectUrl,
        passport.authenticate("local",{
            faliureRedirect:"/login",
            faliureflash:true}),
            userController.validateLogin
);

router.get("/logout",userController.logout);

module.exports=router;