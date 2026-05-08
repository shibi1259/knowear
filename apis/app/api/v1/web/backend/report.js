const express = require("express");
const router = express.Router();
const orderController = require("../../../../controllers/web/backend/order.controller");
const customerController = require("../../../../controllers/web/backend/customer.controller");
const productReportController = require("../../../../controllers/web/backend/product.report.controller");
const controller = require("../../../../controllers/web/backend/report.controller");
const { verifyToken } = require("../../../../middlewares/authorize");

module.exports = () => {
    // router.get(
    //     "/custom-sales-report",
    //     verifyToken,
    //     orderController.generateCustomSalesReport
    // );
  router.get("/download-subscribers", customerController.downloadSubscribers);
  router.get(
    "/product-report",
    verifyToken,
    productReportController.productReport
  );
  
  router.get(
    "/customer-report",
    verifyToken,
    customerController.customerReport
  );
  router.get("/order-report", verifyToken, orderController.orderReport);
  router.get(
    "/customer-order-report",
    verifyToken,
    customerController.customerOrderReport
  );
  router.get(
    "/product-order-report",
    verifyToken,
    productReportController.productOrderReport
  );
  router.get("/detailed-order-report", orderController.getDetailedOrderReport);
  router.get("/download-order-tabs", orderController.downloadOrderTabs);
  router.get("/download-salesreport", orderController.downloadSalesReport);
  router.get("/sales-report", verifyToken, orderController.salesReport);
  router.get(
    "/onlineStoreCartAnalysis",
    verifyToken,
    controller.onlineStoreCartAnalysis
  );
  router.get(
    "/onetimepurchase-report",
    verifyToken,
    orderController.oneTimePurchase
  );
  //  router.get("/orders-report",verifyToken,orderController.ordersReport)
  router.get(
    "/customerdata-report",
    verifyToken,
    customerController.customerData
  ); //customer with order details
  router.get("/inventory-report", verifyToken, controller.abcAnalysisReport);
  router.get("/inventoryAnalysisReport", verifyToken, controller.inventoryAnalysisReport);
  router.get("/behavior-report", verifyToken, controller.behaviorReport);
  router.get("/finance-report", verifyToken, orderController.financeReport);
  router.get(
    "/order-by-location",
    verifyToken,
    controller.generateLocationReport
  ); //order by location -Sales by billing location
  router.get(
    "/order-by-reffer",
    verifyToken,
    controller.generateRegisterMethodReport
  ); //order by login type
router.get("/session-on-reffer", verifyToken, controller.generateReferrerSessionReport);
  router.get(
    "/cart-abandonment",
    verifyToken,
    controller.generateAbandonedCarts
  ); // cart without purchased
  router.get(
    "/convertion-report",
    verifyToken,
    controller.generateConversionReport
  ); // convertion rate of user activity
  router.get(
    "/customer-locations",
    verifyToken,
    controller.generateCustomersByLocationReport
  ); // customer by location
  router.get(
    "/customer-sale-report",
    verifyToken,
    controller.customerSalesReport
  ); // customer report of singlr order and multiple order
  router.get(
    "/one-time-customers",
    verifyToken,
    controller.oneTimeCustomersReport
  ); // single order customers
  router.get(
    "/repeated-customers",
    verifyToken,
    controller.repeatCustomersReport
  ); // single order customers
  // order report
  router.get(
    "/order-fulfillment",
    verifyToken,
    controller.fulfillmentOverTimeReport
  ); // deliverd order report
  router.get(
    "/product-order-return",
    verifyToken,
    controller.productOrdersAndReturnsReport
  ); // product orders and return
  // finance
  router.get("/cogs", verifyToken, controller.costOfGoodsSold); //Cost of goods sold
  router.get(
    "/gross-payment-by-month",
    verifyToken,
    controller.grossPaymentsByMonth
  );

  router.get("/low-stock", verifyToken, controller.productLowStockReport);
  router.get("/no-stock", verifyToken, controller.noStockReport);

  router.get("/enquiryReport", verifyToken, controller.enquiryReport);
  router.get("/product-enquiry", verifyToken, controller.productEnquiryReport);

  // customer analytics report
  router.get(
    "/customer-analytics-report",
    verifyToken,
    controller.customerAnalyticsReport
  );
  //session over time report
  router.get("/session-over-time", verifyToken, controller.sessionByOverTime);
router.get("/session-over-time-report", verifyToken, controller.generateSessionOverTimeReport);
  return router;
};
