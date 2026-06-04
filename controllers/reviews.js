const Review = require("../models/review.js"); //importing review model
const Listing = require("../models/listing.js"); //importing listing model

module.exports.createReview = async(req, res) => {
    let listing = await Listing.findById(req.params.id);
    let newReview = new Review(req.body.review); 
    newReview.author = req.user._id; //setting the author of the review to the current user
    listing.reviews.push(newReview);

    await newReview.save();
    await listing.save();
    req.flash("success", "Review added successfully..");
    res.redirect(`/listings/${listing._id}`); 
}

module.exports.deleteListing = async(req, res) => {
    let {id, reviewId} = req.params; 
    console.log(id, reviewId);
    await Listing.findByIdAndUpdate(id, {$pull: {reviews: reviewId}}); //pulling reviewId from reviews array of listing and updating it
    await Review.findByIdAndDelete(reviewId);
    req.flash("success", "Review deleted successfully..");
    res.redirect(`/listings/${id}`);
}