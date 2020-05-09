const expect = require("chai").expect
const sinon = require("sinon");
const mongoose = require("mongoose");
const dotenv = require("dotenv");

const AuthController = require("../controllers/auth");
const User = require("../models/user");

dotenv.config();

describe("Auth Controller", function() {
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

    it("should throw error code 500 if database access failed", function(done) {
        const req = {
            body: {
                email: "hardik2@mailinator.com",
                password: "something"
            }
        }
        sinon.stub(User, "findOne");
        User.findOne.returns(new Promise((func1, func2) => {func2(new Error("Can't connect to db."))}));
        //User.findOne.throws();
        AuthController.postLogin(req, {}, result => {
            expect(result).to.be.an('error');
            expect(result).to.have.property('statusCode',500);
            done();
        }).catch(error => {
            console.log(error);
            done();
        })

        User.findOne.restore();
    });

    it("should send status for valid user", function(done) {
        const req = {
            userId: '5eadbef974ece81c334955e2'
        };
        const res = {
            statusCode: 500,
            userStatus: null,
            status: function(code) {
                this.statusCode = code;
                return this;
            },
            json: function(data) {
                this.userStatus = data.status;
            }
        }
        AuthController.getStatus(req,res,() => {})
        .then(() => {
            expect(res.statusCode).to.be.equal(200);
            expect(res.userStatus).to.be.equal('I am new!');
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