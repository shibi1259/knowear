const express = require("express")
const router = express.Router()
const controller = require("../../../../controllers/web/backend/popup.controller")
const upload = require("../../../../../util/upload")

module.exports = () => {
    router.post("/manage-popup", upload.any('files'), controller.managePopup);
    router.put("/remove-popup/:type", controller.removePopup);
    router.get("/popup-details", controller.popupDetails);

    return router;
}