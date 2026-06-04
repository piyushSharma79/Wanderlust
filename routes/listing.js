const express = require("express");
const router = express.Router(); 
const Listing = require("../models/listing.js"); //importing listing model
const { isLoggedIn, isOwner, validateListing } = require("../middleware.js");
const listingController = require("../controllers/listings.js"); //importing listing controller
const multer = require('multer'); //importing multer for handling file uploads
const { storage } = require("../cloudConfig.js"); //importing cloudinary storage configuration
const upload = multer({ storage}); //setting up multer to use cloudinary storage for file uploads



//index route to show all listings 
router.get("/", listingController.index);

//search route to search for listings based on location
router.get("/search", listingController.searchListings);

//new route
router.get("/new", isLoggedIn, listingController.renderNewForm);

//show route to show details of a particular listing
router.get("/:id", listingController.showListing);

//create route to create a new listing
router.post("/",
    isLoggedIn,
    upload.single('image'), //middleware to handle file upload, 'image' is the name of the field in the form 
    validateListing,
    listingController.createListing);

//create route to create a new listing with image upload
// router.post("/",upload.single('image'), (req, res) => {
//     res.send(req.file); // we can see the uploaded file details in the response
// });

//edit route to edit for particular listing
router.get("/:id/edit",
    isLoggedIn,
    isOwner, 
    listingController.editListing);

//update route to update a particular listing
router.put("/:id",
    isLoggedIn,
    upload.single('image'), //middleware to handle file upload, 'image' is the name of the field in the form
    validateListing,
    isOwner, 
    listingController.updateListing);

//DELETE ROUTE
router.delete("/:id",isLoggedIn, isOwner, listingController.deleteListing);



module.exports = router; //exporting the router to be used in app.js