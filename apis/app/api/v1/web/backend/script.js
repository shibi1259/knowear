const express = require("express")
const router = express.Router()
const controller = require("../../../../controllers/web/backend/script.controller")

module.exports = () => {
    router.post("/manage-script", controller.validate('manage'), controller.manageScript);
    router.get("/script-details", controller.getScriptDetails);

    return router;
}