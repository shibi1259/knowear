const express = require("express");
const router = express.Router();
const controller = require("../../../controllers/web/page.covers.controller");

module.exports = () => {
    router.get("/pagecovers", controller.getPageCovers)
    
    return router;
};