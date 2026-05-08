const express = require("express");
const router = express.Router();
const controller = require("../../../controllers/web/product.enquiry.controller");

module.exports = () => {
   router.post("/submit-productenquiry", controller.submitProductEnquiry)

   return router;
};
