const express = require("express");
const router = express.Router();
const controller = require("../../../controllers/web/backend/newsletter.subscribers.controller");

module.exports = () => {
    router.post("/subscribe-newsletter", controller.validate("subscribe"), controller.subscribe)
    router.post("/unsubscribe-newsletter", controller.validate("subscribe"), controller.unsubscribe)
    router.post("/verify-subscription", controller.validate("verification"), controller.verifySubscription)

    return router;
};
