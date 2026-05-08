const express = require("express")
const router = express.Router()
const controller = require("../../../../controllers/web/backend/payment.details.controller")

module.exports = () => {
    router.post("/manage-pgdetails", controller.manage);
    router.get("/pg-details/:pgId", controller.findOne);
    router.get("/payment-gateways", controller.find);

    return router;
}