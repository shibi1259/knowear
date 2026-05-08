const express = require("express");
const router = express.Router();
const controller = require("../../../controllers/web/upload.controller");
const authorize = require("../../../middlewares/authorize");
const upload = require("../../../middlewares/web.upload");

module.exports = () => {
    router.post("/upload-media", authorize.verifyUser, upload.single("file"), controller.create)
    router.post("/delete-media", authorize.verifyUser, controller.validate("delete"), controller.delete)

    return router;
};