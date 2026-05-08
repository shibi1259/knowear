const express = require("express");
const router = express.Router();
const controller = require("../../../controllers/web/brand.controller");

module.exports = () => {
   router.get("/brands", controller.getBrands)

   return router;
};
