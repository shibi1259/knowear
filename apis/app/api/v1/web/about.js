const express = require("express");
const router = express.Router();
const controller = require("../../../controllers/web/about.controller");

module.exports = () => {
   router.post("/about", controller.getAboutDetails)

   return router;
};

