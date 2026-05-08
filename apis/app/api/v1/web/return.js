const express = require("express");
const router = express.Router();
const controller = require("../../../controllers/web/backend/return.controller");
const authorize = require("../../../middlewares/authorize");

module.exports = () => {
    router.post("/return-request", authorize.verifyUser, controller.validate("create"), controller.create)

    return router;
};