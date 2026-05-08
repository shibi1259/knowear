const express = require("express");
const router = express.Router();
const controller = require("../../../../controllers/web/backend/cart.controller");

module.exports = () => {
  router.post("/carts", controller.getCart);
  router.post('/cart-products', controller.getCartProducts)
  router.post("/cart-notification", controller.notification);
  return router;
};
