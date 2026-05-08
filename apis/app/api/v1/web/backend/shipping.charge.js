const express = require("express")
const router = express.Router()
const controller = require("../../../../controllers/web/backend/shipping.charge.controller")

module.exports = () => {
    router.post("/manage-shippingcharge", controller.manageCharge);
    router.get("/get-shippingcity", controller.getShippingCity);
    router.get("/get-shippingcharges", controller.getCharges);

    return router;
}