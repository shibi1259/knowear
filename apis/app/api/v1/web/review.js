const express = require("express");
const router = express.Router();
const controller = require("../../../controllers/web/review.controller");
const authorize = require("../../../middlewares/authorize");

module.exports = () => {
    router.post('/add-review', authorize.verifyUser, controller.validate('add'), controller.add)

    return router;
};
