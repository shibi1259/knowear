const express = require("express");
const router = express.Router();
const controller = require("../../../controllers/web/product.controller");
const authorize = require("../../../middlewares/authorize");

module.exports = () => {
  router.post('/product-listing', controller.newPlp)
  router.post("/product-filters", controller.getProductFilters)
  router.post('/product-details', authorize.verifyGuest, controller.getProductDetails)
  router.get('/related-products/:productId', authorize.verifyGuest, controller.getRelatedProducts)
  router.get('/get-suggestions', authorize.verifyCartAuth, controller.getSuggestions)
  router.get('/popular-search',controller.getPopularSearches)

  return router;
};
