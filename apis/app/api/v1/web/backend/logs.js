const express = require("express");
const router = express.Router()
const { find } = require("../../../../controllers/web/backend/logs.controller");

module.exports = () => {
    router.post("/importLogs/:importId", find);

    return router;
}