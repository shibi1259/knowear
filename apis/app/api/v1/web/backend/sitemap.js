const express = require("express")
const router = express.Router()
const controller = require("../../../../controllers/web/backend/sitemap.controller")

module.exports = () => {
    router.post("/create-sitemap", controller.create);
    router.get("/sitemap-details", controller.getSitemaps);

    return router;
}