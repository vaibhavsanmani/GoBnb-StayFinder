const express=require("express");
const app=express();
const mongoose=require("mongoose");
const Listing = require("./models/listing.js");
const path = require("path");
const methodOverride=require("method-override");
const ejsMate=require("ejs-mate");
const wrapAsync=require("./utils/wrapAsync.js");
const ExpressError=require("./utils/ExpressError.js");
const {listingSchema}=require("./schema.js");

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

//Index Route
app.get("/listings", async (req, res) => {
    try {
        let allListings = await Listing.find({}); 
        res.render("listings/index.ejs", { allListings });
    } catch (err) {
        console.log(err);
        res.send("Error fetching listings");
    }
});

//New Route
app.get("/listings/new",async (req,res)=>{
    res.render("listings/new.ejs")
})

//Show Route
app.get("/listings/:id",async (req,res)=>{
    let {id}=req.params;
    const listing=await Listing.findById(id);
    res.render("listings/show.ejs",{listing});
})

//Create Route
app.post("/listings", wrapAsync (async(req,res,next)=>{
    let result = listingSchema.validate(req.body);
    if(result.error){
        throw new ExpressError(400,result.error);
    }
    const newListing=new Listing(req.body.listing);
    await newListing.save();
    res.redirect("/listings");
    console.log(listing);
    })
);

//Edit Route
app.get("/listings/:id/edit", async(req,res)=>{
    let {id}=req.params;
    const listing=await Listing.findById(id);
    res.render("listings/edit.ejs",{listing});
})

//Update Route
app.put("/listings/:id", async (req, res) => {
    try {
        let { id } = req.params;
        await Listing.findByIdAndUpdate(id, { ...req.body.listing });
        res.redirect(`/listings/${id}`);
    } catch (err) {
        console.log(err);
        res.send("Error updating listing");
    }
});

app.delete("/listings/:id",async (req,res)=>{
    let {id}=req.params;
    let deletedListing=await Listing.findByIdAndDelete(id);
    res.redirect("/listings");
})

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