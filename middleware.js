const Listing = require("./models/listing");
const Review = require("./models/review.js"); 
const { reviewSchema, listingSchema } = require("./schema.js"); //importing joi schema for validation

module.exports.isLoggedIn = (req, res, next) => {
    if(!req.isAuthenticated()){
        req.session.redirectUrl = req.headers.referer; //storing the url that the user is trying to access in the session
        req.flash("error", "you must be logged in before performing any action!!");
        return res.redirect("/login");
    }
    next();
}

module.exports.saveRedirectUrl = (req, res, next) => {
    if(req.session.redirectUrl){
        res.locals.redirectUrl = req.session.redirectUrl; //storing the redirect url in res.locals so that it can be accessed in the login route after successful login
    }
    next();
};

module.exports.isOwner = async(req, res, next) => {
    let{ id } = req.params;
    let listing = await Listing.findById(id);

    if(!listing.owner.equals(res.locals.currUser._id)){
        req.flash("error", "You are not the owner of this listing!!");
        return res.redirect(`/listings/${id}`);
    }
    next();
}

module.exports.isReviewOwner = async(req, res, next) => {
    let{ id, reviewId } = req.params;
    let review = await Review.findById(reviewId);

    if(!review){
        req.flash("error", "Review does not exist!");
        return res.redirect(`/listings/${id}`);
    }

    if(!review.author.equals(res.locals.currUser._id)){
        req.flash("error", "You are not the owner of this review!!");
        return res.redirect(`/listings/${id}`);
    }
    next();
}

module.exports.validateListing = (req, res, next) => {
    let { error } = listingSchema.validate(req.body);

    if (error) {
        throw new Error(error);
    } else {
        next();
    }
};

module.exports.validateReview = (req, res, next) => {
    let { error } = reviewSchema.validate(req.body); //validating the request body against the joi schema
    if(error){
        let msg = error.details.map((el) => el.message).join(","); //joining all error messages
        throw new ExpressError(400, msg); //throwing error with status code 400 and error message
    } else {
        next(); //if no error, proceed to the next middleware
    }
};
    