const express=require("express");
const router=express.Router();
const wrapAsync=require("../utils/wrapAsync.js");
const ExpressError=require("../utils/ExpressError.js");
const { listingSchema, reviewSchema } = require("../schema.js");
const Listing = require("../models/listing.js");
const { isLoggedIn } = require("../middleware.js");
const listingController=require("../controllers/listings.js");

const validateListing=(req,res,next)=>{
    let {error}=listingSchema.validate(req.body);
    if(error){
        let errMsg = error.details.map(el => el.message).join(",");
        throw new ExpressError(400,errMsg);
    }else{
        next();
    }
};

//Index Route
router.get("/",wrapAsync(listingController.index));

//New Route
router.get("/new",isLoggedIn,listingController.renderNewForm);

//About Route
router.get("/about", listingController.about);

//Show Route
router.get("/:id",wrapAsync(listingController.showListing));

//Create Route
router.post("/", isLoggedIn,validateListing,wrapAsync(listingController.createListing));

//Edit Route
router.get("/:id/edit",isLoggedIn, listingController.editListing);

//Update Route
router.put("/:id",validateListing,isLoggedIn,listingController.updatelisting);

//Delete Route
router.delete("/:id",isLoggedIn,listingController.deleteListing);

module.exports=router;