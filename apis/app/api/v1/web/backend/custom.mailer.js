const express = require("express");
const router = express.Router();
const controller = require("../../../../controllers/web/backend/custom.mailer.controller");

module.exports = () => {
    router.post("/manage-custommailer", controller.manage);
    router.get("/custom-mailer", controller.findOne);

    return router;
};
