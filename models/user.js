const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const userSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String
    },
    resetToken: String,
    resetTokenExpiry: Date,
    cart: {
        items: [
            {
                productId: {
                    type: Schema.Types.ObjectId,
                    ref: "Product",
                    required: true
                },
                qty: {
                    type: Number,
                    required: true
                }
            }
        ]
    }
});


userSchema.methods.addToCart = function(product) {
    let newQty = 1;
    let updatedCartItems = [...this.cart.items];
    let productIndex = this.cart.items.findIndex(cp => {
        return cp.productId.toString() == product._id.toString();
    });
    if(productIndex >= 0) {
        newQty = this.cart.items[productIndex].qty +1;
        updatedCartItems[productIndex].qty = newQty;
        this.cart.items = updatedCartItems;
    } else {
        this.cart.items.push({productId: product._id,qty:1});
    }
    return this.save();
}

userSchema.methods.deleteItemFromCart = function (productId) {
    const updatedCartItems = this.cart.items.filter(item => {
        return item.productId.toString() != productId.toString();
    });
    this.cart.items = updatedCartItems;
    return this.save();
}

userSchema.methods.clearCart = function() {
    this.cart = {items: []};
    return this.save();
}

module.exports = mongoose.model("User",userSchema);

/* const mongodb = require("mongodb");

const getDb = require("../utils/database").getDb;

class User {
    constructor(username, email, cart, id) {
        this.name = username;
        this.email = email;
        this.cart = cart;
        if(id) 
            this._id = new mongodb.ObjectID(id)
    }
    save() {
        const db = getDb();
        return db.collection("users").insertOne(this);
    }
    static findById(id) {
        const db = getDb();
        return db.collection("users").findOne({_id: new mongodb.ObjectID(id)});
    }
    addToCart(product) {
        let newQty = 1;
        let updatedCartItems = [...this.cart.items];
        let productIndex = this.cart.items.findIndex(cp => {
            return cp.productId.toString() == product._id.toString();
        });
        if(productIndex >= 0) {
            newQty = this.cart.items[productIndex].qty +1;
            updatedCartItems[productIndex].qty = newQty;
            this.cart.items = updatedCartItems;
        } else {
            this.cart.items.push({productId: new mongodb.ObjectID(product._id),qty:1});
        }
        const db = getDb();
        return db.collection("users").updateOne({_id:this._id},{$set: {cart: this.cart}});

    }
    getCart() {
        const db = getDb();
        const productIds = this.cart.items.map(p => {
            return p.productId;
        });
        return db.collection("products")
        .find({_id: {$in: productIds}})
        .toArray()
        .then(products => {
            return products.map(p => {
                return {...p,qty:this.cart.items.find(i => i.productId.toString() == p._id.toString()).qty};
            })
        });
    }
    deleteItemFromCart(productId) {
        const updatedCartItems = this.cart.items.filter(item => {
            return item.productId.toString() != productId.toString();
        })
        const db = getDb();
        return db.collection("users").updateOne({_id:this._id},{$set: {cart: {items: updatedCartItems}}});
    }
    addOrder() {
        const db = getDb();
        return this.getCart().then(products => {
            const order = {
                items: products,
                user: {
                    _id: this._id,
                    name: this.name
                }
            }
            return order;
        })
        .then(order => {
            return db.collection("orders").insertOne(order);
        })
        .then(result => {
            this.cart.items = [];
            return db.collection("users").updateOne({_id:this._id},{$set: {cart: {items: []}}});
        });
    }
    getOrders() {
        const db = getDb();
        return db.collection("orders").find({"user._id":this._id}).toArray();
    }
}

module.exports = User; */