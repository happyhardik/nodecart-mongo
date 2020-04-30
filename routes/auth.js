const express = require("express");
const {check,body} = require("express-validator");

const authController = require("../controllers/auth");
const User = require("../models/user");

const router = express.Router();

router.get("/login", authController.getLogin);
router.post("/login", 
    [
        check('email')
        .isEmail()
        .withMessage("Invalid email address"),

        check("password")
        .isLength({min: 5})
        .isAlphanumeric()
        .withMessage("Invalid password")
    ],
    authController.postLogin);
router.post("/logout", authController.postLogout);
router.get("/signup", authController.getSignUp);
router.post("/signup", 
    [
        check('email')
        .isEmail()
        .withMessage("Invalid email.")
        .normalizeEmail()
        .custom((value, {req})=>{
            return User.findOne({"email":value})
            .then(userDoc => {
                if(userDoc) {
                    return Promise.reject("Email already in use.");
                }
            });
        }),

        body("password", "Password should be alphanumeric and longer than 5 characters.")
        .isLength({min: 5})
        .isAlphanumeric()
        .trim(),

        body("confirmpassword")
        .custom((value, {req}) => {
            if(value !== req.body.password) {
                throw new Error("Passwords does not match.")
            }
            return true;
        })
    ],
    authController.postSignUp);
router.get("/resetpassword", authController.getResetPassword);
router.post("/resetpassword", authController.postResetPassword);
router.get("/resetpassword/:token", authController.getUpdatePass);
router.post("/updatepass", authController.postUpdatePass);
module.exports = router;