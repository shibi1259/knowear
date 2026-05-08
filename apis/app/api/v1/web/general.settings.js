const express = require("express")
const router = express.Router()
const controller = require("../../../controllers/web/backend/general.settings.controller")

module.exports = () => {
   router.get("/settings-details", controller.findOne)
   return router;
}