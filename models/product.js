const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const productSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    imageUrl: {
        type: String,
        required: true
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    }
});

module.exports = mongoose.model("Product", productSchema);
/* const mongodb = require("mongodb");
const getDb = require("../utils/database").getDb;

module.exports = class Product {
    constructor(id, title, description, imageUrl, price, userId) {
        if(id) this._id = new mongodb.ObjectID(id);
        this.title = title;
        this.description = description;
        this.imageUrl = imageUrl;
        this.price = price;
        this.userId = userId;
    }

    save() {
        const db = getDb();
        let dbOps;
        if(this._id) {
            dbOps = db.collection("products")
            .updateOne({_id: this._id}, {$set:this})
        } else {
            dbOps = db.collection("products")
            .insertOne(this)
        }
        return dbOps
        .then(result => {
            console.log(result);
            return result;
        })
        .catch(err => console.log(err));
    }

    static fetchAll() {
        const db = getDb();
        return db.collection("products")
        .find()
        .toArray()
        .then((products) =>{
            return products;
        })
        .catch(err => console.log(err));
    }

    static findById(id) {
        const db = getDb();
        return db.collection("products")
        .find({_id: new mongodb.ObjectId(id)})
        .next()
        .then(product => {
            return product;
        })
        .catch(err => console.log(err));
    }

    static deleteById(id) {
        const db = getDb();
        return db.collection("products").deleteOne({_id: new mongodb.ObjectID(id)});
    }
} */