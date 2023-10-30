require('dotenv').config();

const express = require("express");
const app = express();

const mongoose = require("mongoose");

const dbUrl = process.env.MONGO_URL;

async function main(){
    await mongoose.connect(dbUrl);
}

main()
.then(() => {
    console.log("Connected to Server");
})
.catch((err) => {
    console.log(err);
})

const session = require('express-session');

// for session storage
const MongoStore = require('connect-mongo');
const flash = require('connect-flash');

// session storage
const store = MongoStore.create({
    mongoUrl : dbUrl,
    crypto : {
        secret : process.env.SECRET
    },
    touchAfter : 24 * 3600
});

store.on('error', (err) => {
    console.log("Error in mongo session store",err);
});

const sessionOption = {
    store,
    secret : process.env.SECRET,
    resave : false,
    saveUninitialized: true,
    cookie : {
        expires : Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly : true
    }
};

const path = require("path");
app.set("view engine" , "ejs");
app.set("views" , path.join(__dirname,"views"));
app.use(express.urlencoded({extended : true}));

const passport = require('passport');
const passportLocal = require('passport-local');
const User = require('./models/user.js');

const methodOverride = require("method-override");
app.use(methodOverride("_method"));

const listingsRouter = require('./routes/listing.js');
const reviewsRouter = require('./routes/review.js');
const userRouter = require('./routes/user.js');

// we are installing ejs-mate (help in creating templates/layouts)
// Nav bar website ki har page same rahega to use banao
// more example = footer
const ejsMate = require("ejs-mate");
app.engine('ejs', ejsMate);

// Use of static files
app.use(express.static(path.join(__dirname, "/public")));

const expressError = require('./utils/expressError.js');


app.listen(3000 , () => {
    console.log("Server is Listening");
})

app.use(session(sessionOption));
app.use(flash());

// making passport
app.use(passport.initialize());
app.use(passport.session());
passport.use(new passportLocal(User.authenticate()));

// user se relation jitni bhi information hai use store karaye session me - serialisation
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req,res,next) => {
    res.locals.created = req.flash('created');
    res.locals.error = req.flash('err');
    res.locals.currUser = req.user;
    next();
})

// Express Router
app.use('/listings', listingsRouter);
app.use('/listings/:id/reviews', reviewsRouter);
app.use('/', userRouter);

// agar upar kisi ke saath match nahi hua to iske saath kar do
app.all('*', (req,res,next) => {
    next(new expressError(404,"Page not found !!"));
})

// Error Handling Middleware
app.use((err,req,res,next) => {
    let {statusCode=500, message="Something Went Wrong !!"} = err;
    res.status(statusCode).render("error.ejs", {err});
    // res.status(statusCode).send(message);
})