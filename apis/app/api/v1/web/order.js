const express = require("express");
const router = express.Router();
const controller = require("../../../controllers/web/order.controller");
const authotize = require("../../../middlewares/authorize")

module.exports = () => {
   router.post("/orders", authotize.verifyUser, controller.validate('order-list'), controller.getOrders)
   router.post("/order-summary", authotize.verifyUser, controller.validate('order-summary'), controller.getOrderSummary)
   router.post("/order-details", authotize.verifyUserCondtionally, controller.validate('order-details'), controller.getOrderDetails)
   router.post("/place-order", authotize.verifyUser, controller.placeOrder)
   router.post("/buy-now", authotize.verifyCartAuth, controller.buyNow)
   router.post('/buy-now-order', controller.buyNowOrder);
   router.post("/verify-payment", controller.validate('verify-payment'), controller.verifyPayment)
   router.post("/cod-details", authotize.verifyUser, controller.validate('cart-body'), controller.codDetails)
   router.post("/repeat-order", authotize.verifyUser, controller.validate('order-details'), controller.repeatOrder)
   router.get('/invoice-details/:order', controller.invoiceDetails)
  
   

   return router;
};
