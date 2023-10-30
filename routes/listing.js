const express = require('express');
const router = express.Router({mergeParams: true});

// For handling multipart data type form
const multer = require('multer');
const {storage} = require('../cloudConfig.js');
const upload = multer({storage});

const wrapAsync = require('../utils/wrapAsync.js');
const {isLoggedIn, isOwner, validateListing,editValidateListing} = require('../middleware.js');

const listingController = require('../controllers/listings.js');

router.route("/")
.get(wrapAsync(listingController.index))
.post(isLoggedIn,validateListing,upload.single('listing[image]'),wrapAsync(listingController.createNewListing));

// New Route (CRUD => C:Create)
router.get("/new" ,isLoggedIn, listingController.renderNewForm);

router.route("/:id")
.get(wrapAsync(listingController.showListing))
.put(isLoggedIn,isOwner, upload.single('listing[image]'),editValidateListing, wrapAsync(listingController.editListing))
.delete(isLoggedIn, isOwner, wrapAsync(listingController.destroyListing));

// Update Route (CRUD = U:Update)
router.get("/:id/edit",isLoggedIn,isOwner, wrapAsync(listingController.editForm));

module.exports = router;
