const fs = require("fs");
const PDFDocument = require("pdfkit");
const stripe = require("stripe")(process.env.stripe_secret_key);

const Product = require("../models/product");
const Order = require("../models/order");
const path = require("../utils/path");


const ITEMS_PER_PAGE = 1;

exports.getCart = (req,res,next) => {
    console.log("Get Cart");

    req.user
    .populate("cart.items.productId")
    .execPopulate()
    .then((user) => {
        res.render("shop/cart", {title: "My Cart",path:"/cart",cart:user.cart});
        
    }).catch(err => next(new Error(err)));
}

exports.postCart = (req,res,next) => {
    console.log("Post Cart");

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
    let total =0;
    let products;
    let user;
    req.user
    .populate("cart.items.productId")
    .execPopulate()
    .then((u) => {
        user = u;
        products = user.cart.items;
        
        products.forEach(p => {
            total += p.qty * p.productId.price;
        });
        return stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            line_items: products.map(p => {
                return {
                    name: p.productId.title,
                    description: p.productId.description,
                    amount: p.productId.price*100,
                    currency: 'usd',
                    quantity: p.qty
                };
            }),
            success_url: req.protocol+"://"+req.get('host')+"/checkout/success", //http://localhost:3000/checkout/success
            cancel_url: req.protocol+"://"+req.get('host')+"/checkout/cancel"
        });
    })
    .then((session) => {
        res.render("shop/checkout", {title: "Checkout",path:"/checkout",cart:user.cart, total: total, sessionId: session.id});
    })
    .catch(err => next(new Error(err)));
}

exports.postCheckout = (req,res,next) => {

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

exports.getCheckoutSuccess = (req,res,next) => {
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

exports.postOrderAdd = (req,res,next) => {

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