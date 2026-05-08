const express = require("express");
const router = express.Router();
const controller = require("../../../../controllers/web/backend/permission.controller");

module.exports = () => {
  router.get("/get-permissions", controller.getPermissions);
  router.post("/create-permissions", controller.uploadPermissions);

  return router;
};
