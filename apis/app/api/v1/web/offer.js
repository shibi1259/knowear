const express = require("express");
const router = express.Router();
const controller = require("../../../controllers/web/offer.controller");

module.exports = () => {
   router.post("/offers", controller.getOffers)

   return router;
};
