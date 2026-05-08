const express = require("express")
const router = express.Router()
const  productReportController = require ("../../../../controllers/web/backend/product.report.controller")

module.exports = () => {
    // router.post("/product-report/create-product-report", productReportController.validate('create'), productReportController.create)
    // router.get("/product-report/get-all",productReportController.getAllproductReports)
    // router.get("/product-report/get-active",productReportController.getActiveProductReports)
    // router.put("/product-report/update",productReportController.updateProductReports)

    return router;
}