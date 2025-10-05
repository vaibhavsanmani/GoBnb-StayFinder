const mongoose = require("mongoose");
const { data } = require("./data.js");  // <-- get array directly
const Listing = require("../models/listing.js");

main()
  .then(() => console.log("connection successful"))
  .catch((err) => console.log(err));

async function main() {
  await mongoose.connect("mongodb://127.0.0.1:27017/wanderlust");
}

const initDB = async () => {
  await Listing.deleteMany({});
  const res = await Listing.insertMany(data);
  console.log(`${res.length} listings inserted`);
};

initDB();
