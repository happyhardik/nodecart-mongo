const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);
const mongoose = require("mongoose");
const csrf = require("csurf");
const flash = require("connect-flash");
const multer = require("multer");

const adminRouter = require('./routes/admin');
const shopRouter = require('./routes/shop');
const authRouter = require('./routes/auth');
const errorController = require('./controllers/errors');
const User = require("./models/user");
const configs = require("./utils/configs");

const MONGODB_CONNECTIONSTRING = configs.dbConnectionString;

const store = new MongoDBStore({
    uri: MONGODB_CONNECTIONSTRING,
    collection: "sessions"
});
const app = express();
const csrfProtection = csrf();
const fileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null,'images');
    },
    filename: (req, file, cb) => {
        cb(null, new Date().toISOString()+"-"+file.originalname);
    }
});
const fileFilter = (req,file,cb) => {
    if(file.mimetype === "image/jpg" || file.mimetype === "image/png" || file.mimetype === "image/jpeg") {
        cb(null,true)
    }
    cb(null,false);
}

app.use(flash());
app.set("view engine", "pug");
app.set("views", "views");
app.use(bodyParser.urlencoded({extended: false}));
app.use(multer({storage: fileStorage, fileFilter: fileFilter}).single('image'));
app.use(express.static(path.join(__dirname,"public")));
app.use("/images",express.static(path.join(__dirname,"images")));
// this salt should be passed as a parameter
app.use(session({secret: configs.salt, resave: false, saveUninitialized: false, store: store}));
app.use(csrfProtection);


app.use((req,res,next) => {
    if(req.session.user) {
        return User.findOne(req.session.user._id)
        .then((user) => {
            req.user = user;
            next();
        })
        .catch(err => next(new Error(err)));
    } else return next();
})
app.use((req,res,next) => {
    res.locals.isAuthenticated= req.session.isLoggedIn;
    res.locals.csrfToken = req.csrfToken();
    res.locals.flashErrorMsgs = req.flash('error');
    res.locals.flashSuccessMsgs = req.flash('success');
    return next();
})


app.use("/admin",adminRouter);
app.use(shopRouter);
app.use(authRouter);
//404 handles all not-found routes
app.use(errorController.get404);
//Error route
app.use(errorController.get500);

mongoose.connect(MONGODB_CONNECTIONSTRING).then(result => {
    app.listen(3000);
})
.catch(err => console.log(err)); 

