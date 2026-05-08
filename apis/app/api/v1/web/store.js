const express = require("express");
const router = express.Router();
const controller = require("../../../controllers/web/store.controller");

module.exports = () => {
    router.get('/stores', controller.getStores)
    router.get('/click-points', controller.getClickPoints)

    return router;
};
