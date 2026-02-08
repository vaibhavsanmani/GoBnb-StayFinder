const mongoose = require("mongoose");
const { data } = require("./data.js");
const Listing = require("../models/listing.js");

main()
  .then(() => console.log("connection successful"))
  .catch((err) => console.log(err));

async function main() {
  await mongoose.connect("mongodb://127.0.0.1:27017/wanderlust");
}

const initDB = async () => {
  await Listing.deleteMany({});

  const listingsWithOwner = data.map((obj) => ({
    ...obj,
    owner: new mongoose.Types.ObjectId("69838fcfe65849cdf0db0ed2"),
  }));

  const res = await Listing.insertMany(listingsWithOwner);
  console.log(`${res.length} listings inserted`);
};

initDB();
