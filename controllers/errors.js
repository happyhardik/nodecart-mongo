exports.get404 = (req,res) => res.status(404).render("404",{title:"Page not found"});
exports.get500 = (error, req, res,next) => {
    console.log("Error 500 called");
    console.log(error);
    res.locals.flashErrorMsgs = req.flash('error');
    res.locals.flashSuccessMsgs = req.flash('success');
    res.status(500).render("500",{title:"Internal Server Error"});
}