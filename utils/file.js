const fs = require("fs");

const path = require("./path");

const deleteFile = (filePath) => {
    if(filePath)
        fs.unlink(path.get(filePath), (err) => {
            console.log(err);
            if(err) throw (err);
        })
    else console.log("File not found! File:"+filePath)
}

module.exports.deleteFile = deleteFile;