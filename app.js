const express=require("express");
const app=express();
const mongoose=require("mongoose");
const Listing = require("./models/listing.js");
const path = require("path");
const methodOverride=require("method-override");
const ejsMate=require("ejs-mate");
const wrapAsync=require("./utils/wrapAsync.js");
const ExpressError=require("./utils/ExpressError.js");
const { listingSchema, reviewSchema } = require("./schema.js");
const Review = require("./models/review.js");
const listings =require("./routes/listing.js");

app.engine("ejs",ejsMate);
app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "/public")));

main()
    .then(()=>{console.log("connection successfull")
    })
    .catch(err => console.log(err));

async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/wanderlust');
}

app.get("/",(req,res)=>{
    res.send("working");
})


const validateReview=(req,res,next)=>{
    let {error}=reviewSchema.validate(req.body);
    if(error){
        let errMsg=error.details.map((el)=>el.message).join(",");
        throw new ExpressError(400,errMsg);
    }else{
        next();
    }
};

app.use("/listings",listings);

app.get("/testListing",async (req,res)=>{
    let sampleListing=new Listing({
        title:"my villa",
        description:"buy the beach",
        price:12000,
        location:"Calngute, Goa",
        country:"India",
    })
    await sampleListing.save();
    console.log("saved");
    res.send("successfull"); 
})




// app.get("/listings/:id", async (req, res) => {
//     const { id } = req.params;
//     const listing = await Listing.findById(id);
//     res.render("listings/show", { listing });
// });




//reviews
app.post("/listings/:id/reviews", validateReview,wrapAsync(async (req, res) => {
    const listing = await Listing.findById(req.params.id);
    const newReview = new Review(req.body.review);

    await newReview.save();
    listing.reviews.push(newReview._id);
    await listing.save();

    console.log("new review saved");
    res.redirect(`/listings/${listing._id}`);
}));

//delete review
app.delete("/listings/:id/reviews/:reviewId",wrapAsync(async(req,res)=> {
    let {id,reviewId}=req.params;
    await Listing.findByIdAndUpdate(id,{$pull:{reviews:reviewId}});
    await Review.findByIdAndDelete(reviewId);
    res.redirect(`/listings/${id}`);
}))

app.use((req, res, next) => {
    next(new ExpressError(404, "Page Not Found"));
}); 

app.use((err,req,res,next)=>{
    let{statusCode,message}=err;
    res.render("error.ejs",{message});
    //res.status(statusCode).send(message);
});

app.use((err,req,res,next)=>{
    res.send("something went wrong");
});

app.listen(8080,()=>{
    console.log("server is listening");
});