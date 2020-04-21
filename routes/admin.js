const express = require("express");


const productController = require("../controllers/products");
const isAuth = require("../middleware/is-auth");
const ValidationFlash = require("../middleware/validationflash");


const router = express.Router();

router.get("/product-add", isAuth, productController.productForm);
router.post("/product-add", isAuth, productController.productValidator, ValidationFlash, productController.productForm);
router.get("/product-edit/:productId", isAuth, productController.productForm);
router.post("/product-edit", isAuth, productController.productValidator, ValidationFlash, productController.productForm);

router.get("/products", isAuth, productController.getAdminProducts);

router.delete("/product/:productId", isAuth, productController.deleteProduct);

module.exports = router;
