const express = require("express");
const router = express.Router();
const controller = require("../../../controllers/web/customer.controller");
const tokenController = require("../../../controllers/web/token.controller")
const authorize = require("../../../middlewares/authorize")

module.exports = () => {
   router.get('/user-details', authorize.verifyUser, controller.getCustomerDetails)

   router.post('/add-address', authorize.verifyUser, controller.addAddress)
   router.post('/update-address', authorize.verifyUser, controller.updateAddress)
   router.get('/address', authorize.verifyUser, controller.find)
   router.post('/address-details', authorize.verifyUser, controller.findOne)

   router.get('/wishlist', authorize.verifyUser, controller.getWishlist)
   router.post('/manage-wishlist', authorize.verifyUser, controller.manageWishlist)

   router.post('/notifications', authorize.verifyUser, controller.validate('notifications'), controller.getNotifications)
   router.post('/add-token', authorize.verifyCartAuth, tokenController.validate('add'), tokenController.addToken)
   router.post('/clear-history', authorize.verifyCartAuth, controller.clearHistory)
   router.get('/verify', authorize.verifyUser, controller.generateVerification)
   router.post('/verify-email', controller.verifyEmailAddress)
    router.get('/get-addresslocations',controller.getAddressLocations )
router.get('/get-locationdetails/:placeId',controller.getLocationDetails )
   return router;
};
