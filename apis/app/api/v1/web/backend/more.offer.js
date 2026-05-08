const express = require("express")
const router = express.Router()
const controller = require("../../../../controllers/web/backend/more.offers.controller")

module.exports = () => {
    router.post("/add-moreoffer", controller.validate('create'), controller.add)
    router.get("/moreoffer-details/:offer", controller.getDetails)
    router.get("/search-moreoffers", controller.search)
    router.put("/update-moreoffer", controller.validate('update'), controller.update)

    return router;
}