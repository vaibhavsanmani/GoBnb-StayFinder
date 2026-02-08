const mongoose = require("mongoose");

const listingSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: String,
  price: Number,
  location: String,
  country: String,
  image: {
    filename: String,
    url: String,
  },
  reviews:[
    {
      type:mongoose.Schema.Types.ObjectId,
      ref:"Review",
    }
  ],
  owner:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"User",
  }
});

const Listing = mongoose.model("Listing", listingSchema);

module.exports = Listing;
