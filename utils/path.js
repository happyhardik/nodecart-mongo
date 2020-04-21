const path = require("path");

module.exports.get = (...arr) => {
    if(arr && arr.length >0)
        return path.join(path.dirname(process.mainModule.filename),...arr);
    else return null;
}