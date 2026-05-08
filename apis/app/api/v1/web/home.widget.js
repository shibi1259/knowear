const express = require("express");
const router = express.Router();
const controller = require("../../../controllers/web/backend/home.widget.controller");

module.exports = () => {
    router.get('/preview-widgets', controller.previewWidgets)
    router.get('/history-widgets', controller.historyWidgets)
    router.get('/draft-widgets', controller.draftWidgets)
    router.get('/published-widgets', controller.publishedWidgets)

    return router;
};
