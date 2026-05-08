const express = require("express")
const router = express.Router()
const controller = require("../../../../controllers/web/backend/customer.report.controller")

module.exports = () => {
    router.get("/customers", controller.getAllCustomerReports)

    return router;
}