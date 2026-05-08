const express = require("express");
const router = express.Router();
const controller = require("../../../controllers/web/cart.controller");
const authorize = require("../../../middlewares/authorize")
const giftWrapController = require("../../../controllers/web/backend/gift.wrap.controller");
const shippingNoteController=require("../../../controllers/web/shippingnote.controller")


module.exports = () => {
    router.post("/add-to-cart", authorize.verifyCartAuth, controller.validate('add'), controller.addToCart)
    router.post("/remove-from-cart", authorize.verifyCartAuth, controller.validate('remove'), controller.removeFromCart)
    router.post("/cart", authorize.verifyCartAuth, controller.getCartDetails)
    router.post("/clear-cart", authorize.verifyCartAuth, controller.clearCart)
    router.get("/counts", authorize.verifyCartAuth, controller.getCount)
    router.post("/apply-coupon", authorize.verifyCartAuth, controller.applyCoupon)
    router.post("/remove-coupon", authorize.verifyCartAuth, controller.removeCoupon)
    router.post("/coupons", authorize.verifyCartAuth, controller.getCoupons)
    router.post("/appy-gift-wrap", authorize.verifyCartAuth, controller.appyGiftWrap);
    router.post("/remove-gift-wrap", authorize.verifyCartAuth, controller.removeGiftWrap);
    router.get("/giftwrap-details", giftWrapController.giftWrapDetails);
    router.post("/add-delivery-note", authorize.verifyCartAuth, shippingNoteController.manageDeliveryNote);
    router.post("/remove-delivery-note", authorize.verifyCartAuth, controller.removeDeliveryNote);
    router.post("/delivery-note-details", shippingNoteController.deliveryNoteDetails);
    
    return router;
};

