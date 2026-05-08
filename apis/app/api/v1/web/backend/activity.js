const express = require("express")
const router = express.Router()
const controller = require("../../../../controllers/web/backend/activity.controller")

module.exports = () => {
    router.post("/get-activities", controller.getActivities)

    return router;
}