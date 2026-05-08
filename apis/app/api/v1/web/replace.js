const express = require("express");
const router = express.Router();
const controller = require("../../../controllers/web/replace.controller");
const authorize = require("../../../middlewares/authorize");

module.exports = () => {
    router.post("/replace-request", authorize.verifyUser, controller.validate("add"), controller.initiateReplace)
    
    return router;
};