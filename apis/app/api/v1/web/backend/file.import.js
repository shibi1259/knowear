const express = require("express");
const router = express.Router();
const controller = require("../../../../controllers/web/backend/file.import.controller");

module.exports = () => {
    router.post("/file-imports", controller.getFileImports);
    router.get("/file-import/:importId", controller.findOne);

    return router;
};
