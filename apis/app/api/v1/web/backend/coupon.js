const express = require('express')
const router = express.Router();
const controller = require("../../../../controllers/web/backend/coupon.controller");

module.exports = () => {
    router.post("/add-coupon", controller.validate('create'), controller.create);
    router.get("/coupons", controller.getCoupons);
    router.get("/active-coupons", controller.getActiveCoupons);
    router.post("/product-coupons", controller.getProductCoupons);
    router.post("/coupon-details", controller.getCouponDetails);
    router.post("/search-coupons", controller.validate('search'), controller.getCouponBySearch)
    router.put("/update-coupon", controller.validate('update'), controller.update)

    return router;
}