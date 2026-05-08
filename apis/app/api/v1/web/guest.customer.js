const express = require("express");
const router = express.Router();
const controller = require("../../../controllers/web/guest.customer.controller");

module.exports = () => {
    router.post('/create-guest', controller.create)
    router.get('/guest-details/:token', controller.guestCustomerDetails)
    router.post('/update-guest', controller.update)

    return router;
};
