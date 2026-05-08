const express = require("express")
const router = express.Router()
const orderReportController = require("../../../../controllers/web/backend/order.report.controller")

module.exports = () => {
    router.post("/order-report/create-order-report", orderReportController.validate('create'), orderReportController.create)
    router.get("/order-report/get-all", orderReportController.getAllOrderReports)
    router.get("/order-report/get-active", orderReportController.getActiveOrderReport);
    router.get("/order-report/status",orderReportController.getReportByStatus)
    router.get("/order-report/customer",orderReportController.getReportByCustomer)
    router.get("/order-report/status-customer",orderReportController.getReportByStatusAndCustomer)
    router.get("/order-report/customer-date",orderReportController.getReportByCustomerAndDate)
    router.get("/order-report/status-date",orderReportController.getReportByStatusAndDate)
    router.get("/order-report/customer-status-date",orderReportController.getReportByCustomerAndDateAndStatus)
    router.get("/order-report/date",orderReportController.getOrderByDate)
    router.put("/order-report/update", orderReportController.updateOrderReport)

    return router;
}