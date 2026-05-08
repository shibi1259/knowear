const express = require("express")
const router = express.Router()
const controller = require("../../../../controllers/web/backend/shipping.controller")

module.exports = () => {
    router.post("/manage-shipping", controller.validate('manage'), controller.manage);
    router.get("/shipping-details", controller.details);

    return router;
}