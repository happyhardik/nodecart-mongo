const express = require("express");
const path = require("path");

const router = express.Router();

router.get("/add", (req,res,next) => {
    console.log("Add User form");
    res.send(`<form action="/users/post" method="post"><input type="text" placeholder="User Name" name="username" /><button type="submit">Add</button></form>`)
});
router.post("/post", (req,res,next) => {
    console.log("adding user");
    console.log(req.body.username);
    res.redirect("/");
});
router.get("/", (req,res,next) => {
    console.log("Users page");
    res.sendFile(path.join(__dirname,"..","views","users.html"));
});

module.exports = router;