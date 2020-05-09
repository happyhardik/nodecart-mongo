const expect = require("chai").expect
const sinon = require("sinon");
const mongoose = require("mongoose");
const dotenv = require("dotenv");

const ProductController = require("../controllers/products");
const User = require("../models/user");
const Product = require("../models/product");

dotenv.config();

describe("Product Controller", function() {
    before((done) => {
        mongoose.connect(process.env.dbConnectionStringTest)
        .then(result => {
            const user = new User({
                _id: '5eadbef974ece81c334955e2',
                email: 'hardik3@mailinator.com',
                name: 'hardik3',
                password: '123456',
                cart: []
            });
            return user.save();
        })
        .then(savedUser => {
            done();
        })
        .catch(err => {console.log(err); done();}); 
    })


    it("should be able to create post with associated user with valid inputs", function(done) {
        const req = {
            userId: '5eadbef974ece81c334955e2',
            user: {
                _id: '5eadbef974ece81c334955e2'
            },
            originalUrl: "/admin/product-add",
            method: "POST",
            body: {
                title: "This is test post",
                description: "This is the long description",
                price: 9.99
            },
            file: {
                path: "/images/2020-04-21T06:44:44.158Z-redbook.png"
            },
            validated: true,
            flashMsg: "",
            flash: function(keyword, msg) {
                this.flashMsg = msg;
                //console.log(msg);
            }
        };

        const res = {
            redirect: function(url) {
                //console.log(url);
            }
        }
        ProductController.productForm(req,res,() => {})
        .then(() => {
            expect(req.flashMsg).to.be.equal("Product added successfully.");
            done();
        })
        .catch(err => {console.log(err); done(err);}); 
    });
    after((done) => {
        User.deleteMany({})
        .then(() => {
            return mongoose.disconnect();
        })
        .then(() => {
            done();
        })
    });
});