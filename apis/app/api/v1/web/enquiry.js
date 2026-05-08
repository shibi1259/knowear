const express = require("express");
const router = express.Router();
const controller = require("../../../controllers/web/enquiry.controller");
const authrorize = require("../../../middlewares/authorize");

module.exports = () => {
    router.post('/add-enquiry', controller.add)

    return router;
};
