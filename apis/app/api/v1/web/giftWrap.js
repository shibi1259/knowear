const express = require("express");
const router = express.Router();
const controller = require("../../../controllers/web/gift.wrap.controller");

module.exports = () => {
    router.get("/giftwrap-details", controller.giftWrapDetails);
    return router;
};
