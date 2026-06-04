const mongoose =require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");

const MONGO_URL = 'mongodb://127.0.0.1:27017/wanderlust'; //local mongoDB URL

Main().then(() => {
    console.log("connected to database");
})
.catch((err) => {
    console.log(err);
});

async function Main(){
    await mongoose.connect(MONGO_URL); 
}

const initDB = async () => {
    await Listing.deleteMany({});
    const updatedListings = initData.map((obj) => ({...obj, owner: "69a2d7edb0c81741b0710fda"}))
    await Listing.insertMany(updatedListings);
    console.log("data was initialized");

}
initDB();