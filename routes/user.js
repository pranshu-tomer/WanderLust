const express = require('express');
const router = express.Router({mergeParams : true});

const wrapAsync = require('../utils/wrapAsync.js');
const passport = require('passport');
const {saveRedirectUrl} = require('../middleware.js');

const userController = require('../controllers/user.js');

router.route('/signup')
.get(userController.renderSignupForm)
.post(wrapAsync(userController.newUser));

router.route('/login')
.get(userController.renderLoginForm)
.post(saveRedirectUrl,passport.authenticate("local",{failureRedirect : '/login',failureFlash: true}), wrapAsync(userController.loginUser));

router.get('/logout', userController.logoutUser);

module.exports = router;