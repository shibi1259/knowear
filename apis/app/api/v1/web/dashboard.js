const express = require("express");
const router = express.Router();
const controller = require("../../../controllers/web/dashboard.controller");
const authroize = require("../../../middlewares/authorize")

module.exports = () => {
   router.get("/dashboard", authroize.verifyGuest, controller.dashboard)

   return router;
};
