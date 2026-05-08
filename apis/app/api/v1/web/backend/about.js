const express = require("express")
const router = express.Router()
const controller = require("../../../../controllers/web/backend/about.controller")
const upload = require("../../../../../util/aboutUpload")
const auth = require("../../../../middlewares/authorize")

module.exports = () => {
    router.post("/manage-about", auth.verifyToken, controller.manageAbout)
    router.get("/about-details", controller.getAboutDetails)

    return router;
}