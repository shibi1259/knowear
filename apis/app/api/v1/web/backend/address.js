const express = require("express");
const router = express.Router();
const controller = require("../../../../controllers/web/backend/customer.controller");

module.exports = () => {
    router.post("/add-address", controller.addCustomerAddress)
    router.post("/get-address", controller.getCustomerAddress)
    router.post("/get-default-address", controller.getDefaultAddress)
    router.get("/get-address-details/:address", controller.findOneDetails)
    router.get("/update-default-address/:address", controller.updateDefaultAddress)
    router.get("/delete-address/:address", controller.deleteCustomerAddress)
    router.put("/update-customer-address", controller.updateCustomerAddress)

    return router;
};