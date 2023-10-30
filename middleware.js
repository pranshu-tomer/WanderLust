const Listing = require('./models/listing.js');
const Review = require("./models/review.js");
const expressError = require('./utils/expressError.js');
const {listingSchema} = require('./validation.js');
const { reviewSchema} = require('./validation.js');

module.exports.isLoggedIn = (req,res,next) => {
    // self built in passport
    // req.user = user related details are here
    if(!req.isAuthenticated()){
        // usi page pe jaaye jaha se login liya
        req.session.redirectUrl = req.originalUrl;
        // req ke paas bahut saari information hoti hai
        req.flash("err","You must be logged in to create lsiting!");
        return res.redirect('/login');  
    }
    next();
}

module.exports.saveRedirectUrl = (req,res,next) => {
    if(req.session.redirectUrl){
        res.locals.redirectUrl = req.session.redirectUrl;
    }
    next();
}

module.exports.isOwner = async (req,res,next) => {
    let {id} = req.params;
    let listing = await Listing.findById(id);
    if(!listing.owner._id.equals(res.locals.currUser._id)){
        req.flash("err","You are not Owner of this listing!!");
        return res.redirect(`/listings/${id}`);
    }

    next();
}

module.exports.editValidateListing = (req,res,next) => {
    const {error} = listingSchema.validate(req.body);
    if(error){
        console.log(error);
        let errorMsg = error.details.map((el) => el.message).join(",");
        throw new expressError(400,errorMsg);
    } else {
        next();
    }
}

module.exports.validateListing = (req,res,next) => {
    const {error} = listingSchema.validate(req.body.listing);
    if(error){
        let errorMsg = error.details.map((el) => el.message).join(",");
        throw new expressError(400,errorMsg);
    } else {
        next();
    }
}

module.exports.validateReview = (req,res,next) => {
    const {error} = reviewSchema.validate(req.body);
    if(error){
        let errorMsg = error.details.map((el) => el.message).join(",");
        throw new expressError(400,errorMsg);
    } else {
        next();
    }
}

// upload.single('listing[image]'),

module.exports.isAuthor = async (req,res,next) => {
    let {id, reviewId} = req.params;
    let review = await Review.findById(reviewId);
    if(!review.author._id.equals(res.locals.currUser._id)){
        req.flash("err","You did  not create this review!!");
        return res.redirect(`/listings/${id}`);
    }

    next();
}