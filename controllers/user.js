const User = require('../models/user.js');
const expressError = require('../utils/expressError.js');

module.exports.renderSignupForm = (req,res) => {
    res.render('users/signUp.ejs');
}

module.exports.newUser = async(req,res) => {
    try{
        let {username, email, password} = req.body;
        const newUser = new User({email,username});

        const registeredUser = await User.register(newUser, password);
        console.log(registeredUser);

        req.login(registeredUser, (err) => {
            if(err){
                return next(err);
            } 
            req.flash('created', "Welcome to WanderLust");
            res.redirect('/listings');
        })
    } catch(err){
        req.flash('err', err.message);
        res.redirect('/signup');
    }
}

module.exports.renderLoginForm = (req,res) => {
    res.render('users/login.ejs');
}

module.exports.loginUser = async(req,res) => {
    req.flash('created', "Welcome Back to WanderLust!!");
    // res.redirect(req.session.redirectUrl); 
    // one problem is here jab login hota hai to passport session ko dobara banataa hai
    // So we store in local passport ke pass unhe delete karne ki permission nahi hai
    let redirectUrl = res.locals.redirectUrl || "/listings";
    res.redirect(redirectUrl);
}

module.exports.logoutUser = (req,res,next) => {
    req.logout((err) => {
        if(err){
            return next(err);
        }
        req.flash("created", "LogOut Successfully. See you soon!!");
        res.redirect('/listings');
    })
}