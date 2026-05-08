const express = require("express");
const router = express.Router();
const controller = require("../../../../controllers/web/backend/enquiry.controller");

module.exports = () => {
    router.put('/update-enquiry', controller.update)
    router.post('/search-enquiry', controller.search)
    router.get('/get-enquiry/:enquiryId', controller.findOne)

    return router;
};
