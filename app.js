if(process.env.NODE_ENV != "production"){
    require('dotenv').config(); // to load environment variables from .env file
}

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const sampleListings = require("./init/data.js"); //importing sample data to populate DB 
const path = require("path");
const ejsMate = require("ejs-mate"); //importing ejs-mate for ejs templating
const Listing = require("./models/listing.js"); //importing listing model
const session = require("express-session"); //importing express-session for flash messages
const MongoStore = require("connect-mongo"); //importing connect-mongo to store session in MongoDB

const flash = require("connect-flash"); //importing connect-flash for flash messages
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js")
const { saveRedirectUrl} = require("./middleware.js");

const listingRouter = require("./routes/listing.js"); //importing listing routes
const reviewRouter = require("./routes/review.js"); //importing review routes
const userRouter = require("./routes/user.js"); //importing user routes

const dbURL = process.env.ATLASDB_URL;

const port = process.env.PORT || 8080;
//DB connection
Main().then(() => {  
    console.log("connected to DB");
}).catch((err) => {
    console.log(err);
});

//async function to connect to DB
async function Main(){
    await mongoose.connect(dbURL);
    console.log("✅ Connected to MongoDB");

    // insert new data
    await Listing.insertMany(sampleListings);
    console.log("🌱 Sample listings inserted successfully");

    // await mongoose.connection.close();
    // console.log("🔒 Connection closed");
}

app.set("view engine", "ejs"); //setting ejs as the view engine
app.set("views", path.join(__dirname, "views")); //setting views directory
app.use(express.urlencoded({ extended: true})); //to parse the body of the request
app.use(methodOverride("_method")); //to use HTTP verbs such as PUT or DELETE
app.engine("ejs", ejsMate); //using ejs-mate as the engine for ejs templating
app.use(express.static(path.join(__dirname, "/public"))); //to serve static files such as css, js, images


const store = MongoStore.create({
    mongoUrl: dbURL,
    crypto: {
        secret: process.env.SECRET, 
    },
    touchAfter: 24 * 3600,
});

store.on("error", (err) => {
    console.log("session store error:", err);
});

const sessionOptions = {
    store,
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        expires: Date.now() + 7 * 24 * 60 * 60* 1000, //cookie expires in 7 days
        maxAge: 7 * 24 * 60 *60 * 1000, //max age in milliseconds7 * 24 * 60 * 1000
        httpOnly: true,
    },
};

// creating API  
app.get("/", (req, res) => {
    res.redirect("/listings"); // we can see this in browser
});



app.use(session(sessionOptions)); //to use sessions for flash messages
app.use(flash()); 

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res,next) =>{
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    next();
});

// app.get("/demouser", async(req, res)=>{
//     let fakeUser = new User({
//         email: "student@gmail.com",
//         username: "demo-student",
//     });

//     let registeredUser = await User.register(fakeUser, "helloWorld"); //registering user with passport-local-mongoose, it will hash the password and save the user in the database
//     res.send(registeredUser);
// });

app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewRouter); 
app.use("/", userRouter); //user routes for registration and login

app.use((err, req, res, next) => {
    let { statuscode =500, message = "something went wrong!"} =err;
    res.render("error.ejs", {err});
});

//server creation
app.listen(port, () => {
    console.log(`server is listening on port ${port}`);
});