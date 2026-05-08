const express = require("express")
const router = express.Router()
const controller = require("../../../../controllers/web/backend/notification.controller")

module.exports = () => {
    router.post("/add-notification", controller.create)
    router.get("/notifications", controller.find)
    router.get("/notification-details/:notificationId", controller.findOne)
    router.post("/search-notifications", controller.search)
    router.put("/update-notification", controller.update)
    router.delete("/delete-notification/:notificationId", controller.delete)

    router.post('/latest-notifications', controller.getLatestNotifications)
    router.post("/module-notifications", controller.moduleNotifications)

    return router;
}