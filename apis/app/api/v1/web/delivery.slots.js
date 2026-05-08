const express = require("express");
const router = express.Router();
const controller = require("../../../controllers/web/backend/delivery.slots.controller");

module.exports = () => {
    router.get('/deliveryslots/:day', controller.getDeliverySlotsPerDay)

    return router;
};
