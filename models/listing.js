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
  }
});

const Listing = mongoose.model("Listing", listingSchema);

module.exports = Listing;
