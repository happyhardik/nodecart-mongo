const {validationResult} = require("express-validator");
module.exports = (req,res,next) => {
    const errors = validationResult(req);
    req.validated = true;
    errors.array().forEach(i => {
        req.validated = false;
        if(i.msg != "Invalid value") {
            req.flash("error",i.msg);
        } else {
            console.log(`Invalid value "${i.value}" for ${i.param}.`);
            req.flash("error",`Invalid value "${i.value}" for ${i.param}.`);
        }  
    });
    res.locals.flashErrorMsgs = req.flash('error');
    res.locals.flashSuccessMsgs = req.flash('success');
    console.log("ValidationFlash next");
    next();
    
}