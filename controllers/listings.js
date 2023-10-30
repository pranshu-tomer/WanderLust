const Listing = require('../models/listing.js');
const multer = require('multer');

module.exports.index = async (req,res) => {
    const allListing = await Listing.find({});
    res.render("./listings/index.ejs" , {allListing});
}

module.exports.renderNewForm = (req,res) => {
    res.render("./listings/new.ejs");
}

module.exports.createNewListing = async (req,res) => {
    // let {title,description,image,price,location,country} = req.body;
    // let listing = req.body.listing;
    let url = req.file.path;
    let filename = req.file.filename;
    const newlisting = new Listing(req.body.listing);
    newlisting.owner = req.user._id;
    newlisting.image = {url,filename};
    await newlisting.save();
    req.flash("created", "New listing created !!");
    res.redirect("/listings");
}

module.exports.showListing = async (req,res) => {
    let {id} = req.params;
    const listing = await Listing.findById(id).populate({path : "reviews", populate: {path : "author"}}).populate("owner");

    if(!listing) {
        req.flash('err', "Listing you rquested does not exist!!");
        res.redirect('/listings');
    }

    res.render("./listings/show.ejs" , {listing});
}

module.exports.editForm = async (req,res) => {
    let {id} = req.params;
    const listing = await Listing.findById(id);

    if(!listing) {
        req.flash('err', "Listing you rquested does not exist!!");
        res.redirect('/listings');
    }

    let originalUrl = listing.image.url;
    // By cloudinary Upi properties
    originalUrl = originalUrl.replace("/upload","/upload/w_250");

    res.render("./listings/edit.ejs" , {listing,originalUrl});
}

module.exports.editListing = async (req,res) => {
    let {id} = req.params;
    let listing = await Listing.findByIdAndUpdate(id , {...req.body.listing});

    if(typeof req.file !== 'undefined'){
        let url = req.file.path;
        let filename = req.file.filename;
        listing.image = {url,filename};
        await listing.save();
    }
    
    req.flash('created', 'Listing Updated !!');
    res.redirect(`/listings/${id}`);
}

module.exports.destroyListing = async  (req,res) => {
    let {id} = req.params;
    let deleted = await Listing.findByIdAndDelete(id);
    console.log(deleted);
    req.flash("created", "Listing Deleted Successfully!!");
    res.redirect("/listings");
}

