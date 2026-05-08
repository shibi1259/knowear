const express = require("express");
const router = express.Router();
const controller = require("../../../../controllers/web/backend/product.enquiry.controller");

module.exports = () => {
  router.get("/search-productenquiry", controller.find);
  router.get("/productenquiry/:enquiryId", controller.findOne);
  router.put("/update-productenquiry/:enquiryId", controller.update);

  return router;
};
