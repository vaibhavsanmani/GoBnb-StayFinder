const Listing = require("../models/listing");
const axios = require("axios");
module.exports.index = async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", { allListings });
};
module.exports.renderNewForm=(req,res)=>{
    res.render("listings/new.ejs")
}
module.exports.about=(req, res) => {
    res.render("listings/about");
}
module.exports.showListing=async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id)
      .populate("owner")
      .populate({path:"reviews",
        populate:{
        path:"author",
      }});
    if (!listing) {
      req.flash("error", "Listing not found!!");
      return res.redirect("/listings");
    }
    res.render("listings/show.ejs", { listing, mapApiKey: process.env.MAP_API_KEY });
};

module.exports.createListing = async (req, res) => {

  let url = req.file.path;
  let filename = req.file.filename;

  const newListing = new Listing(req.body.listing);
  newListing.owner = req.user._id;
  newListing.image = { url, filename };

  const address = `${newListing.location}, ${newListing.country}`;

  const geoRes = await axios.get(
    "https://api.opencagedata.com/geocode/v1/json",
    {
      params: {
        q: address,
        key: process.env.OPENCAGE_API_KEY
      }
    }
  );

  if (geoRes.data.results.length > 0) {
    const loc = geoRes.data.results[0].geometry;

    newListing.geometry = {
      type: "Point",
      coordinates: [loc.lng, loc.lat]
    };
  } else {
    const fallback = { lat: 20.5937, lng: 78.9629 };

    newListing.geometry = {
      type: "Point",
      coordinates: [fallback.lng, fallback.lat]
    };
  }
  try{
      await newListing.save();
      req.flash("success", "Listing created!");
      res.redirect("/listings");

    } catch (err) {
      console.log("Geocoding error:", err.message);
      req.flash("error", "Location service failed");
      res.redirect("/listings/new");
    }
};

module.exports.editListing = async (req, res) => {
    let { id } = req.params;

    const listing = await Listing.findById(id);

    if (!listing) {
        req.flash("error", "Listing not found");
        return res.redirect("/listings");
    }

    res.render("listings/edit.ejs", { listing });
};
module.exports.updatelisting=async (req, res) => {
    try {
        let { id } = req.params;
        let listing=await Listing.findByIdAndUpdate(id, { ...req.body.listing });

        if(typeof req.file !== 'undefined'){
        let url=req.file.path;
        let filename=req.file.filename;
        listing.image={url,filename};
        await listing.save();
        }
        req.flash("success","listing updated!!");
        res.redirect(`/listings/${id}`);
    } catch (err) {
        console.log(err);
        res.send("Error updating listing");
    }
};
module.exports.deleteListing=async (req,res)=>{
    let {id}=req.params;
    let deletedListing=await Listing.findByIdAndDelete(id);
    req.flash("success","listing deleted!!");
    res.redirect("/listings");
};