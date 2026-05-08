const express = require("express")
const router = express.Router()
const controller = require("../../../controllers/web/more.offers.controller")
const authorize = require("../../../middlewares/authorize")

module.exports = () => {
    router.get("/moreoffers", authorize.verifyCartAuth, controller.moreOffers)
    router.post("/moreoffers-listing", authorize.verifyCartAuth, controller.moreOffersListing)

    return router;
}