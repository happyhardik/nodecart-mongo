const expect = require("chai").expect
const jwt = require("jsonwebtoken");
const sinon = require("sinon");

const authMiddleware = require("../middleware/auth");

describe("Auth Middleware", function() {
    it("should throw error if auth header not set", function() {
        const req = {
            get: function(headerName) {
                return null;
            }
        }
        expect(authMiddleware.bind(this, req, {}, () => {})).to.throw();
    });
    
    it("should throw error if auth header is single string", function() {
        const req = {
            get: function(headerName) {
                return 'abcd';
            }
        }
        expect(authMiddleware.bind(this, req, {}, () => {})).to.throw();
    });

    it("should add userId to res, when successful", function() {
        const req = {
            get: function(headerName) {
                return 'bearer abcd';
            }
        }
        //Stubs or mocking the verify function
        sinon.stub(jwt, 'verify');
        jwt.verify.returns({userId:'abc'});
        authMiddleware(req, {}, () => {});
        expect(req).to.have.property("userId", 'abc');
        expect(jwt.verify.called).to.be.true;
        jwt.verify.restore();
    });

    it("should throw error if invalid token is passed", function() {
        const req = {
            get: function(headerName) {
                return 'bearer abcd';
            }
        }
        expect(authMiddleware.bind(this, req, {}, () => {})).to.throw();
    });

})

