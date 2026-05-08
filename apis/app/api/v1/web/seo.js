const express = require("express");
const router = express.Router();
const controller = require("../../../controllers/web/seo.controller");

module.exports = () => {
    router.get("/seodetails", controller.details)
    
    return router;
};