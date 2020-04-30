const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const sendgirdTransport = require("nodemailer-sendgrid-transport");
const {validationResult} = require("express-validator");


// the key is being deleted after usage :)
const transporter = nodemailer.createTransport(sendgirdTransport({
    auth: {
        api_key: process.env.sendGridApiKey
    }
}));

const User = require("../models/user");

exports.getLogin = (req, res, next) => {
    res.render('auth/login', {
        path: "/login",
        pageTitle: "Login",
        isAuthenticated: req.session.isLoggedIn
    })
}

exports.postLogin = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        req.flash("error", errors.array()[0].msg);
        return res.status(422).render('auth/login', {
            path: "/login",
            pageTitle: "Login",
        })
    }
    User.findOne({email: email})
    .then((user)=>{
        if(!user) {
            req.flash("error", "Invalid email or password.");
            return res.redirect("/login");
        }
        bcrypt.compare(password,user.password)
        .then(result => {
            if(result) {
                req.session.user = user;

                req.session.isLoggedIn = true;
                return req.session.save(err => {
                    req.flash("success", "Logged In.");
                    res.redirect("/");
                });
            } else {
                req.flash("error", "Invalid email or password.");
                return res.redirect("/login");
            }
        })
        .catch(err => {console.log(err); req.flash("error","Something went wrong."); res.redirect("/login")});
    }).catch(err => next(new Error(err)));
     
}

exports.postLogout = (req, res, next) => {
    req.session.destroy((err)=> {
        if(err) console.log(err);
        res.redirect("/")
    })
}

exports.getSignUp = (req, res, next) => {
    res.render('auth/signup', {
        path: "/signup",
        pageTitle: "Signup",
        oldInput: {
            email: "",
            password: "",
            confirmpassword: ""
        },
        validationErrors: []
    })
}
exports.postSignUp = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    const confirmPassword = req.body.confirmpassword;

    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        req.flash("error", errors.array()[0].msg);
        console.log(errors.array());
        return res.status(422).render('auth/signup', {
            path: "/signup",
            pageTitle: "Signup",
            oldInput: {
                email: email,
                password: password,
                confirmpassword: confirmPassword
            },
            validationErrors: errors.array()
        })
    }
    else {
        return bcrypt.hash(password,12)
        .then(passwordhash => {
            const user = new User({
                name: "Test",
                email: email,
                password: passwordhash,
                cart: {
                    items: []
                }
            });
            return user.save();
        })
        .then(result => {
            req.flash("success","Signup successfully, please login");
            return transporter.sendMail({
                to: email,
                from: "happyhardik@gmail.com",
                subject: "Signup successful!",
                html: "<h1>hola!</h1><h2>You have signed up successfully.</h2>"
            })
        })
        .then(result => {
            res.redirect("/login");
        })      
        .catch(err => next(new Error(err)));
    }
    
}

exports.getResetPassword = (req, res, next) => {
    res.render('auth/resetpassword', {
        path: "/resetpassword",
        pageTitle: "Reset Password",
    })
}

exports.postResetPassword = (req, res, next) => {
    const email = req.body.email;
    let token;
    User.findOne({email: email})
    .then(user => {
        if(!user) {
            req.flash("error","Unable to find user!");
            return res.redirect("/resetpassword");
        }
        token = crypto.randomBytes(32).toString("hex");
        user.resetToken = token;
        user.resetTokenExpiry = Date.now()+3600000;
        return user.save()
    })
    .then(result => {
        res.redirect("/");
        transporter.sendMail({
            to: email,
            from: "happyhardik@gmail.com",
            subject: "Password reset link",
            html: `
            <p>You have requested to reset your password on our website. </p>
            <p>Please click on the following link to reset your password: <a href="http://localhost:3000/resetpassword/${token}"> Click here</a></p>
            ` 
        })
    })
    .catch(err => {
        console.log(err); 
        req.flash("error", "Something went wrong.");
        res.redirect("/resetpassword");
    });
}

exports.getUpdatePass = (req,res, next) => {
    const token = req.params.token;
    User.findOne({resetToken: token, resetTokenExpiry: {$gt: Date.now()}})
    .then((user) => {
        if(!user) {
            req.flash("error", "Invalid token.");
            return res.redirect("/login");
        }
        return res.render('auth/updatepass', {
            path: "/updatepass",
            pageTitle: "Update Password",
            userId: user._id.toString(),
            token: token
        })
    })
    .catch(err => {
        console.log(err); 
        req.flash("error", "Something went wrong.");
        res.redirect("/login");
    });
    
}
exports.postUpdatePass = (req,res, next) => {
    const token = req.body.token;
    const userId = req.body.userId;
    const password = req.body.password;
    User.findOne({_id: userId, resetToken: token, resetTokenExpiry: {$gt: Date.now()}})
    .then((user) => {
        if(!user) {
            req.flash("error", "Invalid token, cannot find user");
            return res.redirect("/login");
        }
        return bcrypt.hash(password,12)
        .then(passwordhash => {
            user.password = passwordhash;
            user.resetToken = null;
            user.resetTokenExpiry = null;
            return user.save();
        })
    })
    .then(result => {
        req.flash("success", "Password reset successfully.");
        res.redirect("/login");
    })
    .catch(err => {
        console.log(err); 
        req.flash("error", "Something went wrong.");
        res.redirect("/login");
    });
}
