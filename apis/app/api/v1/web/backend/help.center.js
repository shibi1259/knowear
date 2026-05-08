const express = require("express")
const router = express.Router()
const controller = require("../../../../controllers/web/backend/help.center.controller")
const authorize = require("../../../../middlewares/authorize")

module.exports = () => {
    router.post("/manage-helpcenter", authorize.verifyToken, controller.validate('manage'), controller.manage)
    router.get("/help-center", authorize.verifyToken, controller.getDetails)
    router.get("/share-verification", authorize.verifyToken, controller.shareVerification)
    router.post("/verify-support-email", controller.verifySupportEmail)

    return router;
}