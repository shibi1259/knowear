const express = require("express");
const router = express.Router();
const controller = require("../../../controllers/web/backend/mega.menu.controller");

module.exports = () => {
    router.get('/website-menubar', controller.menu)

    return router;
};