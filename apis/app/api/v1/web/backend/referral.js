const express = require("express");
const router = express.Router();
const controller = require("../../../../controllers/web/backend/referral.controller")

module.exports = () => {
    router.post('/manage-referral', controller.manageReferral)
    router.get('/referral-program', controller.referralDetails)
    router.post('/invited-customers', controller.invitedCustomers)

    return router;
}
