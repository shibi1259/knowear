const express = require("express")
const router = express.Router()
const socialController = require("../../../controllers/web/social.controller")

module.exports = () => {
    router.post("/create-social",socialController.create);
    router.get("/get-socials",socialController.getSocialDetails);

    return router;
}