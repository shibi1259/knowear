const express = require("express")
const router = express.Router()
const controller = require("../../../../controllers/web/backend/banner.controller")

module.exports = () => {
    router.post("/add-banner", controller.validate('create'), controller.create);
    router.get("/banners", controller.getAllBanner);
    router.post('/banner-images', controller.getAllBannerImages)
    router.post("/search-banners", controller.searchBanners)
    router.get("/banners/count", controller.getBannersCount)
    router.get("/banners/active", controller.getActiveBanner);
    router.get("/banner", controller.getBannerBySlug);
    router.put("/update-banner", controller.updateHomeBanner);

    return router;
}