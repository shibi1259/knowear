const express = require("express");
const router = express.Router();
const controller = require("../../../../controllers/web/backend/customer.controller");
const upload = require("../../../../../util/upload");

module.exports = () => {
    router.post("/create-customer", controller.validate('create'), controller.create)
    router.delete("/delete-customer/:userid", controller.delete)
    router.get("/customer/get-customers", controller.getAllClient);
    router.get("/customers/count", controller.getClientCount);
    router.get("/customer/get-customer/active", controller.getActiveClient);
    router.post("/customer/mail", controller.getCustomerByQuery)
    router.get("/customer/slug", controller.getClientBySlug)
    router.post("/customer/number", controller.getClientByNumber)
    router.put("/customer/update", controller.validate('update'), controller.update)
    router.post("/search-customers", controller.searchCustomers)
    router.post("/download-customers", controller.downloadCustomers)
    router.post("/wishlist", controller.getWishlist)
    router.get("/top-wishlisted", controller.getTopWishlisted)
    router.get("/wishlist-details/:user", controller.getWishlistDetails)
    router.post("/search-subscribers", controller.getSubscribers)
    router.get("/delete-subscriber/:subscriber", controller.deleteSubscriber)
    router.get("/download-subscribers", controller.downloadSubscribers)
    router.get("/customer-details/:customer", controller.getCustomerDetails)
    router.post("/get-customer-details", controller.customerDetails)
    router.get("/referral-history/:customer", controller.customerReferralHistory)
    router.post("/import-users", upload.single("file"), controller.importUsers)

    return router;
};