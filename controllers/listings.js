const Listing = require("../models/listing");
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
    res.render("listings/show.ejs", { listing });
};
module.exports.createListing=async(req,res,next)=>{
    const newListing=new Listing(req.body.listing);
    newListing.owner=req.user._id;
    await newListing.save();
    req.flash("success","New listing created!!");
    return res.redirect("/listings");
};
module.exports.editListing=async(req,res)=>{
    let {id}=req.params;
    const listing=await Listing.findById(id);
    res.render("listings/edit.ejs",{listing});
};
module.exports.updatelisting=async (req, res) => {
    try {
        let { id } = req.params;
        await Listing.findByIdAndUpdate(id, { ...req.body.listing });
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