const mongodb = require("mongodb");

const MongoClient = mongodb.MongoClient;

let _db;

const mongoConnect = (cb) => {
    MongoClient.connect("mongodb+srv://mongodb_user:urvi222jogF7ydSL@cluster0-lz5u1.gcp.mongodb.net/shop?retryWrites=true&w=majority")
    .then(client => {
        console.log("Connected to Mongo");
        _db = client.db();
        cb();
    })
    .catch(err => {
        console.log(err);
        throw err;
    });
    
}
const getDb = () => {
    if(_db) {
        return _db;
    }
    throw "No database connection found";
}

module.exports.mongoConnect = mongoConnect;
module.exports.getDb = getDb;
