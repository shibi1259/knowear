const express = require("express")
const router = express.Router()
const controller = require("../../../controllers/web/backend/payment.details.controller")

module.exports = () => {
    router.get("/paymentgateways", controller.paymentGateways);

    return router;
}