const {body,validationResult} = require("express-validator");

const Product = require("../models/product");
const Order = require("../models/order");
const FileHelper = require("../utils/file");


const ITEMS_PER_PAGE = process.env.defaultPageSize;

exports.productValidator = [
    body("title")
        .isString()
        .isLength({min:3})
        .trim(),
    //body("imageUrl")
    //    .isURL(),
    body("price")
        .isFloat(),
    body("description")
        .isLength({min:5,max:400})
        .trim(),
        
];

const renderForm = (verb, product, res) => {
    console.log("Rendering form");
    res.render("admin/product-edit", {title: verb+" Product",path:"admin/product-"+verb.toLowerCase(), verb: verb.toLowerCase(), product: product});
}
exports.productForm = async (req,res,next) => {
    
    if(req.originalUrl == "/admin/product-add") verb = "Add"; else verb = "Edit";
    let product = null;
    if(verb == "Edit") {
        const productId = req.method == "POST"?req.body.id:req.params.productId;
        if(!productId) {
            req.flash("error",`Cannot find product.`);
            return next(new Error("Cannot find product id."));
        }
        try {
            product = await Product.findById(productId);
        } catch (err) { 
            return next(new Error("Cannot find product."));
        }
    } else {
        product = new Product();
    }
    
    if(req.method == "POST") {
        if(req.body.id) product._id = req.body.id;
        product.title = req.body.title;
        product.description = req.body.description;
        product.price = req.body.price;
        product.userId = req.user._id;

        image = req.file;
        console.log(image);
        if(verb == "Add" && !image) {
            req.flash("error",`Failed to save the image.`);
            return renderForm(verb, product, res);
        }
        if(image) {
            if(product.imageUrl) FileHelper.deleteFile(product.imageUrl);
            product.imageUrl = image.path;
        }
        
        
        if(!req.validated) {
            return renderForm(verb, product, res);
        }
    
        return product.save().then(() => {
            req.flash("success",`Product ${verb}ed successfully.`);
            res.redirect("/admin/products");
        }).catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
    }
    
    return renderForm(verb, product, res);
}

exports.getProductAdd = (req,res,next) => {
    console.log("Add Product form");
    res.render("admin/product-edit", {title: "Add Product",path:"admin/product-add", verb: "add", product: {}});
}

exports.postProductAdd = (req,res,next) => {
    console.log("adding product");
    const product = new Product({
        title: req.body.title,
        description: req.body.description,
        imageUrl: req.body.imageUrl,
        price: req.body.price,
        userId: req.user._id
    });

    if(!req.validated) {
        return res.redirect(req.originalUrl);
    }
    
    product.save().then(() => {
        req.flash("success","Product added successfully.");
        res.redirect("/admin/products");
    }).catch(err => next(new Error(err)));
}

exports.getProductUpdate = (req,res,next) => {
    console.log("Update Product form");
    
    const editMode = req.query.edit;
    if(!editMode) { res.redirect("/");}
    const productId = req.params.productId;
    Product.findById(productId)
    .then(product=>{
        if(!product) res.redirect("/");
        res.render("admin/product-edit", {title: "Update Product",path:"admin/product-edit", verb: "edit", product: product});

    }).catch(err => next(new Error(err)));
}

exports.postProductUpdate = (req,res,next) => {
    console.log("update product");
    
    Product.findById(req.body.id)
    .then(product => {
        product.title = req.body.title;
        product.description = req.body.description;
        product.imageUrl = req.body.imageUrl;
        product.price = req.body.price;
        product.userId = req.user._id;
        return product.save();
    })
    .then((product)=>{
        console.log(product);
        res.redirect("/admin/products");
    }).catch(err => next(err));
}

exports.deleteProduct = (req,res,next) => {
    console.log("delete product");
    Product.findById(req.params.productId)
    .then(product => {
        if(!product) return res.status(500).json({"message":"error!","error":"Cannot find the product"});
        FileHelper.deleteFile(product.imageUrl);
        return Product.findByIdAndRemove(req.params.productId);
    })
    .then(result => {
        console.log("Product destroyed");
        res.status(200).json({"message":"Success!"});
        //res.redirect("/admin/products");
    }).catch(err => res.status(500).json({"message":"error!","error":err}));
}

exports.getProducts = (req,res,next) => {
    console.log("This is the products page.");
    const page = +req.query.page || 1;
    let totalItems;
    Product.find().countDocuments()
    .then(totalProducts => {
        totalItems = totalProducts;
        return Product
            .find()
            .skip((page-1)*ITEMS_PER_PAGE)
            .limit(ITEMS_PER_PAGE)
    })
    .then(products => {
        res.render("shop/product-list",{
            title: "All Products", 
            products: products,
            path:"/products", 
            currentPage: page,
            hasNextPage: page*ITEMS_PER_PAGE<totalItems,
            hasPrevPage: page>1,
            lastPage: Math.ceil(totalItems/ITEMS_PER_PAGE)
        });
    }).catch(err => next(err));
}
exports.getProductDetails = (req,res,next) => {
    console.log("This is the product details page.");
    const pId = req.params.productId;
    Product.findById(pId).then(product => {
        if(!product) { next(); throw "No product found!!!"; }
        res.render("shop/product-details",{title: product.title, product: product,path:"/products"});
    });
}
exports.getAdminProducts = (req,res,next) => {
    console.log("This is the admin products page.");

    const page = +req.query.page || 1;
    let totalItems;
    Product.find().countDocuments()
    .then(totalProducts => {
        totalItems = totalProducts;
        return Product
            .find()
            .skip((page-1)*ITEMS_PER_PAGE)
            .limit(ITEMS_PER_PAGE)
    })
    .then(products => {
        res.render("admin/products",{
            title: "All Products", 
            products: products,
            path:"admin/products", 
            currentPage: page,
            hasNextPage: page*ITEMS_PER_PAGE<totalItems,
            hasPrevPage: page>1,
            lastPage: Math.ceil(totalItems/ITEMS_PER_PAGE)
        });
    }).catch(err => next(err));
}