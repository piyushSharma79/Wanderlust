const Listing = require("../models/listing.js"); //importing listing model

module.exports.index = async (req, res) => {
    const allListings = await Listing.find({}); //fetching all listings from the database
    res.render("listings/index", {allListings}); //rendering index.ejs file and passing allListings data to it
}

module.exports.renderNewForm = (req, res) => {
    res.render("listings/new.ejs");  //rendering new.ejs file
}

module.exports.showListing = async (req, res) => {
    let {id} = req.params; //getting id from params
    const listing = await Listing.findById(id)
    .populate({
        path: "reviews",
        populate: {
            path: "author",
        },
        })
    .populate("owner"); //fetching listing from the database and populating reviews and owner data
    
    if(!listing){
        req.flash("error", "listing not found!!");
        return res.redirect("/listings");
    }
    console.log(listing);
    return res.render("listings/show.ejs", {listing}); //rendering show.ejs file and passing listing data to it
}

module.exports.createListing = async(req, res, next) => {
    try{
    let listing = req.body.listing; //getting listing data from the body of the request
    
    let url = req.file.path;
    let filename = req.file.filename;

    const newListing = new Listing(req.body.listing); //creating new listing 
    newListing.owner = res.locals.currUser._id; //setting the owner of the listing to the current user    
    newListing.image =  {url, filename}; //setting the image url and filename to the listing, we can access it later in the show.ejs file to display the image
    await newListing.save(); //saving new listing to the database
    req.flash("success", "new listing created successfully..");
    res.redirect("/listings"); //redirecting to the show page of the new listing
    }catch(err) {
        next(err);
    }
};

module.exports.renderEditForm = async(req, res) => {
    let {id} = req.params; //getting id from params
    const listing =  await Listing.findById(id); //fetching listing from the database
    if(!listing){
        req.flash("error", "listing not found!!");
        return res.redirect("/listings");
    }

    let originalImageUrl = "";
    if(listing.image && listing.image.url){
        originalImageUrl = listing.image.url.replace("/upload", "/upload/h_300,w_250");
    }
    res.render("listings/edit.ejs", { listing, originalImageUrl });
};

module.exports.updateListing = async(req, res) => {
    let {id} = req.params;
    let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing }); //we use ... to spread the listing data from the body of the request and update the listing in the database
    
    if(typeof req.file !== "undefined"){
        let url = req.file.path;
        let filename = req.file.filename;
        listing.image = { url, filename }; //updating the image url and filename to the listing, we can access it later in the show.ejs file to display the image
        await listing.save();
    }
    
    req.flash("success", "Listing updated successfully..");
    res.redirect(`/listings/${id}`);
}

module.exports.editListing = async(req, res) => {
    let {id} = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/edit.ejs", {listing});  //render means in simple terms to open the file of edit.ejs with the listing data
}

module.exports.deleteListing = async(req, res) =>{
    let {id} = req.params;
    let deletedListing =await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    req.flash("success", "Listing deleted successfully..");
    res.redirect("/listings"); //redirecting to index route after deletion
}

module.exports.searchListings = async(req, res) => {
    try{
        let {query} = req.query; //getting query from query parameters
        let listings;
        if(query){
            listings = await Listing.find({country: { $regex: query, $options: "i"}}); //$options: "i" makes the search case insensitive, $regex is used to search for a pattern in the location field of the listing 
        }else{
            listings = await Listing.find({}); 
        }
        res.render("listings/index", {allListings: listings }); 
    }catch(err) {
        console.log(err);
        res.redirect("/listings");
    }
};