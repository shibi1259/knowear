const express = require("express")
const router = express.Router()
const controller = require("../../../../controllers/web/backend/page.limits.controller")

module.exports = () => {
   router.post("/add-page-limits", controller.add)
   router.get("/page-limits", controller.getPageLimits)
   router.get("/page-limit", controller.getPageLimitById)
   router.get("/page-limits/count", controller.getPageLimitCount)
   router.put("/update-page-limits", controller.update)
   return router;
}