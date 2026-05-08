const express = require("express");
const router = express.Router();
const controller = require("../../../../controllers/web/backend/auth.controller");
const auth = require("../../../../middlewares/authorize");

module.exports = () => {
  router.post("/admin-login", controller.validate("login"), controller.adminLogin);
  router.post("/register", controller.validate("register"), controller.register);
  router.post("/add-admin", controller.validate("register"), controller.addAdminUser)
  router.put("/update-admin", controller.updateAdminDetails)
  router.put("/update-admin-user", auth.verifyToken, controller.validate("update"), controller.updateAdminUser)
  router.post("/reset-admin-password", auth.verifyToken, controller.validate("reset-password"), controller.resetAdminPassword)
  router.get("/admin-users", controller.getAdminUsers)
  router.post("/search-admins", controller.validate('search'), controller.searchAdminUsers)
  router.get("/admin-user", controller.getAdminUser)
  router.post("/admin-details", auth.verifyToken, controller.getAdminDetails)
  router.post('/get-admin-mail', controller.getAdminByEmail)
  router.post("/logout", auth.verifyToken, controller.logout);
  router.post("/users-bulk-import", controller.bulkImport);
  router.post("/users-bulk-export", controller.bulkExport);
  router.get("/authorize", auth.verifyToken, controller.authorizeAdmin);
  router.post("/search", controller.search)
  router.post("/subscribe-admin", auth.verifyToken, controller.subscribeAdmin)
  router.post("/forgot-password", controller.forgotPassword)
  router.post("/reset-token", controller.resetToken)
  router.post("/reset-password", controller.resetPassword)
  router.post('/duplicate-email', controller.duplicateEmail)
  router.post('/delete-admin', controller.deleteAdmin)
  router.put('/update-admin-email', controller.validate('update-email'),controller.updateAdminEmail)
  router.put('/update-admin-mobile', controller.validate('update-mobile'),controller.updateAdminMobile)
  router.put('/change-password', controller.changePassword)

  return router;
};                   