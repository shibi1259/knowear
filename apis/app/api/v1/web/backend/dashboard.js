const express = require('express')
const router = express.Router();
const controller = require("../../../../controllers/web/backend/dashboard.controller");
const salesController = require("../../../../controllers/web/backend/sales.controller");

module.exports = () => {
   router.post("/dashboard", controller.dashboard)
   router.post("/monthly-revenue", controller.monthlyRevenue)
   router.post("/daily-revenue", controller.daysRevenue)
   router.post("/current-revenues", controller.currentMonthRevenue)
   router.post('/top-selling-products', controller.topSellingProducts)
   router.post('/new-orders', controller.newOrders)
   router.post("/publish-dashboard", controller.publishDashboard)
   router.post("/preview-dashboard", controller.previewDashboard)
   router.get('/dashboard-config', controller.dashboardConfig)
   router.post('/monthly-comparison', controller.monthlyComparison)
   router.post('/sales-analytics', controller.salesAnalytics)
   router.post('/sales', salesController.sales)
   router.get('/store-tips', controller.storeTips)

   return router
}