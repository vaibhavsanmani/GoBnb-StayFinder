if(process.env.NODE_ENV != "production"){require('dotenv').config()}
console.log("Cloud name:", process.env.CLOUD_NAME);

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
const userRouter = require("./routes/user.js");
const listings =require("./routes/listing.js");
const reviewRoutes =require("./routes/review.js");
const session=require("express-session");
const MongoStore = require("connect-mongo").default;
const flash=require("connect-flash");
const passport=require("passport");
const LocalStrategy = require("passport-local").Strategy;
const User=require("./models/user.js");
const { isLoggedIn } = require("./middleware.js");

app.engine("ejs",ejsMate);
app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "/public")));


const dbUrl = process.env.ATLASDB_URL;

async function startServer() {
  try {
    console.log("Connecting to:", dbUrl ? "URL exists" : "URL missing");

    await mongoose.connect(dbUrl, {
      serverSelectionTimeoutMS: 30000,
      family: 4
    });

    console.log("✅ MongoDB Connected");

    const store = MongoStore.create({
      mongoUrl: dbUrl,
      crypto: {
        secret: process.env.SECRET,
      },
      touchAfter: 24 * 3600,
    });

    const sessionOptions = {
      store,
      secret: process.env.SECRET,
      resave: false,
      saveUninitialized: true,
      cookie: {
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge: 7 * 24 * 60 * 60 * 1000,
      },
    };

    app.use(session(sessionOptions));
    app.use(flash());

    app.use(passport.initialize());
    app.use(passport.session());
    passport.use(new LocalStrategy(User.authenticate()));

    passport.serializeUser(User.serializeUser());
    passport.deserializeUser(User.deserializeUser());


    app.use((req,res,next)=>{
        res.locals.success=req.flash("success");
        res.locals.error=req.flash("error");
        res.locals.currUser=req.user;
        next();
    })

    app.use("/listings",listings);
    app.use("/listings/:id/reviews", reviewRoutes);
    app.use("/", userRouter);

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

    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`🚀 Server listening on ${PORT}`);
    });

  } catch (err) {
    console.log("❌ DB Connection Failed:");
    console.log(err);
  }
}

startServer();
