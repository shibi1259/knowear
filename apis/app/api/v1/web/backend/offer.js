const express = require("express");
const router = express.Router();
const controller = require("../../../../controllers/web/backend/offer.controller");

module.exports = () => {
  router.post("/add-offer", controller.create);
  router.get("/offers", controller.find);
  router.get("/offer/:offer", controller.findOne);
  router.put("/update-offer", controller.update);
  router.post("/search-offers", controller.search)

  return router;
};
