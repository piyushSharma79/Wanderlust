const mongoose = require("mongoose"); //importing mongoose
const Schema = mongoose.Schema; //to create schema

//defining schema for listing
const listingSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    description: String,
    image: {
        url: String,
        filename: String,
    },
    price: Number,
    location: String,
    country: String,
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: "Review",
        },
    ],
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User",
    },
    // category: {
    //     type: String,
    //     enum: ["mountains", "arctic", "farms", "deserts"],
    // }
});

const Listing = mongoose.model("Listing", listingSchema); //creating model
module.exports = Listing; //exporting model