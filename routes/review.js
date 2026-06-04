const express = require("express");
const router = express.Router({ mergeParams: true }); //to access params from parent router so that we can get listing id
const { isLoggedIn, isReviewOwner, validateReview } = require("../middleware.js");

const reviewController = require("../controllers/reviews.js");

//Reviews-POST Route
router.post("/",
    isLoggedIn, 
    validateReview, 
    reviewController.createReview
);

//Deletetion of Reviews
router.delete("/:reviewId",
    isLoggedIn, 
    isReviewOwner,
    reviewController.deleteListing,
);

module.exports = router;