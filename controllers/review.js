const Review = require("../models/review.js");
const Listing = require("../models/listing.js");

module.exports.newReview = async(req,res) => {
    let listing = await Listing.findById(req.params.id);
    let newReview = new Review(req.body.review);
    newReview.author = req.user._id;

    listing.reviews.push(newReview);

    await newReview.save();
    await listing.save();

    req.flash('created', 'New Review Posted. thanks!!');

    res.redirect(`/listings/${req.params.id}`);
}

module.exports.destroyReview = async (req,res) => {
    let {id, reviewId} = req.params;

    await Listing.findByIdAndUpdate(id, {$pull : {reviews: reviewId}});
    await Review.findByIdAndDelete(reviewId);

    req.flash('created', 'Review Deleted Successfully!!');

    res.redirect(`/listings/${id}`);
}