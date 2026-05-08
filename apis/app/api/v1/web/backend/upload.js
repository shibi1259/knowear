const express = require("express");
const router = express.Router();
const controller = require("../../../../controllers/web/upload.controller");
const upload = require("../../../../middlewares/upload");

module.exports = () => {
    router.post("/upload-media", upload.single("file"), controller.create)
    router.post("/delete-media", controller.validate("delete"), controller.delete)

    return router;
};