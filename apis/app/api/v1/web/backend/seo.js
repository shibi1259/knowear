const express = require("express")
const router = express.Router()
const controller = require("../../../../controllers/web/backend/seo.controller")

module.exports = () => {
    router.post("/manage-seodetails", controller.validate('create'), controller.create);
    router.get("/seo-details", controller.findSeo);
    router.get("/seo-detail/:seo", controller.findSeoDetails);

    return router;
}