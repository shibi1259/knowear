const express = require("express");
const router = express.Router();
const controller = require("../../../../controllers/web/backend/media.controller");
const upload = require("../../../../middlewares/upload");
const s3Upload = require("../../../../middlewares/s3.upload");

module.exports = () => {
    router.post("/add-medias",s3Upload.any("files"), controller.addMedias);
    router.post("/medias", controller.validate('search'), controller.getMedias);
    router.get("/medias/:mediaId", controller.getMediaDetails);
    router.put("/update-media/:mediaId", controller.updateMedia);
    router.get("/download-media/:mediaId", controller.downloadMedia);
    router.post("/media-urls", controller.saveMediaUrls);
    router.post("/delete-medias", controller.deleteMedias);

    return router;
};