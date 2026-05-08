const express = require("express");
const router = express.Router();
const controller = require("../../../controllers/web/general.settings.controller");

module.exports = () => {
    router.get('/settings', controller.getSettings)
    
    return router;
};
