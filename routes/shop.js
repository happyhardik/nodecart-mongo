const express = require("express");

const productController = require("../controllers/products");

const shopController = require("../controllers/shop");
const isAuth = require("../middleware/is-auth");

const router = express.Router();

router.get("/", shopController.getIndex);

router.get("/cart", isAuth, shopController.getCart);
router.post("/cart", isAuth, shopController.postCart);
router.post("/cart-item-delete", isAuth, shopController.postCartItemDelete);
router.get("/checkout", isAuth, shopController.getCheckout);
router.get("/checkout/success", isAuth, shopController.getCheckoutSuccess);
router.get("/checkout/cancel", isAuth, shopController.getCheckout);
router.get("/orders", isAuth, shopController.getOrders);

router.get("/products", productController.getProducts);
router.get("/product/:productId", productController.getProductDetails);
//router.post("/post-order-add", isAuth, shopController.postOrderAdd);
router.get("/order/:orderId", isAuth, shopController.getOrderInvoice);

module.exports = router;