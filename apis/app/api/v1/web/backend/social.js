const express = require("express")
const router = express.Router()
const socialController = require("../../../../controllers/web/backend/social.controller")

module.exports = () => {
    router.post("/create-social",socialController.create);
    router.get("/get-social",socialController.getSocialDetails);

    return router;
}