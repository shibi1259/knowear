const express = require("express");
const router = express.Router();
const controller = require("../../../../controllers/web/backend/guest.customer.controller");

module.exports = () => {
    router.get('/search-guests', controller.search)
    router.get('/guest-details/:token', controller.findOne)

    return router;
};
