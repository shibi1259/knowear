const express = require("express");
const router = express.Router();
const controller = require("../../../../controllers/web/backend/csv.controller");
const upload = require("../../../../middlewares/upload");
const authorize = require("../../../../middlewares/authorize");

module.exports = () => {
    router.post("/import-images", authorize.verifyToken, upload.single("file"), controller.importImages);

    return router;
};
