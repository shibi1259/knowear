const express = require("express")
const router = express.Router()
const controller = require("../../../../controllers/web/backend/home.settings.controller")

module.exports = () => {
   router.post("/home-settings/add", controller.add)
   router.get("/home-settings", controller.getHomeSettings)
   router.get("/home-setting", controller.getHomeSettingsBySlug)
   router.get("/home-settings/count", controller.getHomeSettingsCount)
   router.put("/home-settings/update", controller.update)
   return router;
}