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
const reviewRoutes =require("./routes/review.js");
const session=require("express-session");
const flash=require("connect-flash");

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

const sessionOptions={
    secret:"mysupersecretcode",
    resave:false,
    saveUninitialized:true,
    cookie:{
        expires:Date.now()+7*24*60*60*1000,
        maxAge:7*24*60*60*1000,
    },
}

app.use(session(sessionOptions));
app.use(flash());

app.use((req,res,next)=>{
    res.locals.success=req.flash("success");
    next();
})


app.get("/",(req,res)=>{
    res.send("working");
})

app.use("/listings",listings);
app.use("/listings/:id/reviews", reviewRoutes);

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
app.use((req, res, next) => {
    next(new ExpressError(404, "Page Not Found"));
}); 

app.use((err,req,res,next)=>{
    let{statusCode,message}=err;
    res.render("error.ejs",{message});
    //res.status(statusCode).send(message);
});

app.listen(8080,()=>{
    console.log("server is listening");
});