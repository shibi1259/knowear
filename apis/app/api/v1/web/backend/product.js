const express = require("express");
const router = express.Router();
const controller = require("../../../../controllers/web/backend/product.controller");
const upload = require("../../../../../util/upload");
const { createBulkProducts } = require("../../../../controllers/web/backend/import.products.controller");

module.exports = () => {
    router.post("/create-products", controller.createProducts);
    router.post("/add-product", controller.create);
    router.get("/products", controller.find);
    router.get("/products/active", controller.getActiveProduct);
    router.post("/get-products", controller.getProducts);
    router.get("/product-details/:product", controller.findOne);
    router.put("/update-product", controller.update);
    router.post("/search-products", controller.search)
    
    router.post("/import-createBulkProducts", upload.single('file'), createBulkProducts)
    router.post("/import-updateBulkProducts", upload.single('file'), controller.updateBulkProducts)

    router.delete("/delete-product/:productId", controller.delete);
    router.delete("/delete-products", controller.deleteProducts) // delete products by sku

    return router;
};
