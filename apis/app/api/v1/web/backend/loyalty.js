const express = require("express");
const router = express.Router();
const controller = require("../../../../controllers/web/backend/loyalty.controller");

module.exports = () => {
    router.post("/manage-loyalty", controller.manageLoyalty);
    router.get("/loyalty-details", controller.loyaltyDetails);

    return router;
};
