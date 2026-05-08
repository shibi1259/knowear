const express = require("express")
const router = express.Router()
const controller = require("../../../../controllers/web/backend/feed.controller")

module.exports = () => {
   router.get("/export-feed", controller.exportFeed)
   router.post("/manage-feed", controller.validate('manage'), controller.manageFeed)
   router.get("/feed-details", controller.feedDetails)

   return router;
}