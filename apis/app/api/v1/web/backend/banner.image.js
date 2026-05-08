const express = require("express");
const router = express.Router();
const controller = require("../../../../controllers/web/backend/banner.image.controller");

module.exports = () => {
    router.post("/create-bannerimage", controller.validate("create"), controller.create);
    router.put("/update-bannerimage", controller.validate("update"), controller.update);
    router.delete("/delete-bannerimage/:bannerimage", controller.delete);
    router.get("/bannerimages", controller.search);

    return router;
};
