const express = require("express");
const router = express.Router();
const controller = require("../../../../controllers/web/backend/newsletter.subscribers.controller");
const authorize = require("../../../../middlewares/authorize");

module.exports = () => {
    router.get("/export-newsletter-subscribers", controller.exportSubscribers)
    router.get("/newsletter-subscribers", authorize.verifyToken, controller.getSubscribers)

    return router;
};
