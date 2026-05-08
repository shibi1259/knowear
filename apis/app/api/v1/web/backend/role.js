const express = require("express");
const router = express.Router();
const controller = require("../../../../controllers/web/backend/role.controller");

module.exports = () => {
  router.post("/add-role", controller.validate("manage-role"), controller.addRole);
  router.get("/roles", controller.getRoles);
  router.post("/search-roles", controller.validate("search"), controller.searchRoles);
  router.get("/active-roles", controller.getActiveRoles);
  router.get("/role-details/:role", controller.getRoleDetails);
  router.put("/update-role", controller.validate("manage-role"), controller.updateRole);

  return router;
};
