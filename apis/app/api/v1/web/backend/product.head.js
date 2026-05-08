const express = require("express")
const router = express.Router()
const controller = require("../../../../controllers/web/backend/product.head.controller")

module.exports = () => {
   router.post("/add-product-head", controller.validate('create'), controller.add);
   router.get("/product-head/:product", controller.productDetails);
   router.get("/head-details/:productId", controller.getDetails);
   router.get("/parent-details/:product", controller.getParentDetails);
   router.get("/product-heads", controller.getAllProductHead)
   router.post('/search-product-heads', controller.searchProductHeads)
   router.put("/update-product-head", controller.validate('update'), controller.update);
   router.get("/child-products", controller.getChildProducts)

   return router;
}