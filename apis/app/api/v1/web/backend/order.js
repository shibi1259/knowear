const express = require("express");
const router = express.Router();
const controller = require("../../../../controllers/web/backend/order.controller");

module.exports = () => {
  router.post("/create-order", controller.validate("create"), controller.create);
  router.post("/orders", controller.getOrder);
  router.post("/order-details", controller.getOrderDetails)
  router.get("/order-payment-acceptance", controller.orderPaymentAcceptance)
  router.get("/orders/number", controller.getOrderDetails);
  router.post("/orders/refid", controller.getOrderByRefid);
  router.get("/orders/count", controller.orderCount);
  router.get("/orders/pending", controller.getPendingOrder);
  router.get("/orders/pending/number", controller.getPendingOrderByNumber);
  router.get("/orders/active", controller.getActiveOrder);
  router.post("/orders/search", controller.searchOrder);
  router.post("/orders/pending/search", controller.searchPendingOrder)
  router.get("/status-list", controller.getOrderStatusList)
  router.post("/order-counts", controller.orderCounts)
  router.put("/update-order", controller.updateOrder);
  router.put("/update-order-products", controller.updateOrderProducts);
  router.put("/update-product-payment", controller.validate('update-status'), controller.updateOrderPayment);
  router.put("/cancel-order-details", controller.validate("cancel"), controller.cancelOrderDetails);
  router.put("/update-status", controller.validate('update-status'), controller.updateOrderStatus)
  router.put('/update-product-quantity', controller.updateProductQuantity)
  router.post('/add-order-product', controller.addProduct)
  router.post('/manage-tags', controller.validate('manage-tags'), controller.manageOrderTags)
  router.get('/invoice-details/:order', controller.invoiceDetails)
  router.post("/export-order-tabs", controller.exportOrderTabs)
  router.put("/bulk-order-update", controller.bulkOrderUpdate)
  router.post("/bulk-orders", controller.bulkOrders) // For bulk invoice and bulk packing slip
  router.post("/track-orders", controller.trackOrderProducts) 
  router.post("/request-pickup", controller.requestPickUp)
  router.get("/order-shippingnumber", controller.getOrderShippingNumber)
  router.put("/update-order-status-from-product-history", controller.updateOrderStatusFromProductHistory)
  return router;
};

