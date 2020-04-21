const fs = require("fs");
const PDFDocument = require("pdfkit");

const Product = require("../models/product");
const Order = require("../models/order");
const path = require("../utils/path");

const ITEMS_PER_PAGE = 1;

exports.getCart = (req,res,next) => {
    console.log("Get Cart");
    if(!req.user) res.redirect("/login");
    req.user
    .populate("cart.items.productId")
    .execPopulate()
    .then((user) => {
        res.render("shop/cart", {title: "My Cart",path:"/cart",cart:user.cart});
        
    }).catch(err => next(new Error(err)));
}

exports.postCart = (req,res,next) => {
    console.log("Post Cart");
    if(!req.user) res.redirect("/login");
    console.log(req.user);
    const productId = req.body.productId;
    Product.findById(productId)
    .then(product =>{
        return req.user.addToCart(product);
    })
    .then(result => {
        res.redirect("/cart");
    })
    .catch((err)=> next(new Error(err))); 
}

exports.getCheckout = (req,res,next) => {
    console.log("Checkout");
    res.render("shop/checkout", {title: "Checkout",path:"/checkout"});
}

exports.getIndex = (req,res,next) => {
    console.log("Index Called");
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
        res.render("shop/index",{
            title: "My Shop", 
            products: products,
            path:"/", 
            currentPage: page,
            hasNextPage: page*ITEMS_PER_PAGE<totalItems,
            hasPrevPage: page>1,
            lastPage: Math.ceil(totalItems/ITEMS_PER_PAGE)
        });
    }).catch(err => next(err));
}
exports.getOrders = (req,res,next) => {
    console.log("Get Orders");
    if(!req.user) res.redirect("/login");
    Order.find({"user.userId": req.user._id})
    .then((orders)=> {
        res.render("shop/orders", {title: "Orders",path:"/orders", orders: orders});
    })
    .catch(err => next(new Error(err)));
}

exports.postCartItemDelete = (req,res,next) => {
    if(!req.user) res.redirect("/login");
    req.user.deleteItemFromCart(req.body.id)
    .then(result => {
        res.redirect("/cart");
    }).catch(err => next(new Error(err)));
}
exports.postOrderAdd = (req,res,next) => {
    if(!req.user) res.redirect("/login");
    req.user
    .populate("cart.items.productId")
    .execPopulate()
    .then((user) => {
        products = req.user.cart.items.map(p => {
            console.log(p);
            return p = {product: {...p.productId._doc}, qty: p.qty};
        })
        const order = new Order({
            user: {
                email: req.user.email,
                userId: req.user
            },
            products: products
        });
        return order.save();
    })
    .then (result =>{
        return req.user.clearCart();
    })
    .then (result => {
        res.redirect("/orders");
    })
    .catch(err => next(new Error(err)));
}

exports.getOrderInvoice = (req,res,next) => {
    const orderId = req.params.orderId;
    if(!orderId) next(new Error(err));
    return Order.findById(orderId)
    .then((order)=> {
        if(order && order.user.userId.toString() == req.user._id.toString()) {
            const invoiceName = "invoice-"+orderId+".pdf";
            const invoicePath = path.get("data","invoices",invoiceName);
            res.setHeader("Content-Type","application/pdf");
            res.setHeader("Content-Disposition",`inline; filename=${invoiceName}`);
            
            /* Creating pdf on the fly */
            const pdfDoc = new PDFDocument();
            pdfDoc.pipe(fs.createWriteStream(invoicePath));
            pdfDoc.pipe(res);
            pdfDoc.fontSize(36).text("Invoice",{underline:true});
            pdfDoc.fontSize(18).text("-------------------------------");
            let totalPrice = 0;
            order.products.forEach((prod) => {
                pdfDoc.text(prod.product.title+" - "+prod.qty+" x $"+prod.product.price);
                totalPrice += prod.qty*prod.product.price;
            });
            pdfDoc.text("------------------------------");
            pdfDoc.fontSize(24).text("Total Price: $"+totalPrice);
            pdfDoc.end();
            
            /* return pdf file without steaming */
            // return fs.readFile(invoicePath, (err,data) => {
            //     if(err) return next(err);
            //     res.send(data);
            // });

            /* return pdf file with streaming */
            // const fileSteam = fs.createReadStream(invoicePath);
            // fileSteam.pipe(res);
        }
        else return next(new Error("No order found!"));
    })
    .catch(err => next(err));
    
}