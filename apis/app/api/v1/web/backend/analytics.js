const express = require("express")
const router = express.Router()
const controller = require("../../../../controllers/web/backend/analytics.controller")

module.exports = () => {
    router.post("/manage-analytics", controller.validate('manage'), controller.manageAnalytics);
    router.get("/analytics-details", controller.getAnalyticsDetails);

    return router;
}