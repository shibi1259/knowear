const express = require("express");
const router = express.Router();
const controller = require("../../../../controllers/web/backend/gift.wrap.controller");

module.exports = () => {
    router.post("/manage-giftwrap", controller.manageGiftWrap);
    router.get("/giftwrap-details", controller.giftWrapDetails);

    return router;
};
