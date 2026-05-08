const express = require("express")
const router = express.Router()
const controller = require("../../../../controllers/web/backend/apps.controller")
const uploads = require("../../../../../util/upload")

module.exports = () => {
    router.post("/manage-apps", controller.manage);
    router.get("/apps", controller.apps);
    router.post("/app-icons", uploads.single('file'), controller.manageAppIcon);
    router.post("/splash-icons", uploads.single('file'), controller.managSplashIcon);

    return router;
}