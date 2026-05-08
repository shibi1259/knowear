const express = require("express");
const router = express.Router();
const controller = require("../../../../controllers/web/backend/mailer.controller");

module.exports = () => {
  router.post("/manage-mailers", controller.manageMailers);
  router.get("/mailer-details", controller.mailerDetails);

  return router;
};
