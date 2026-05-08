const express = require("express");
const router = express.Router();
const controller = require("../../../../controllers/web/backend/review.controller")

module.exports = () => {
   router.post("/search-reviews", controller.validate('search'), controller.searchReviews)
   router.put("/update-review", controller.validate('update'), controller.updateReview)
   router.post("/product-reviews", controller.validate('product-reviews'), controller.productReviews)

   return router;
}
