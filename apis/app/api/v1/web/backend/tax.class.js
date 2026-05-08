const express = require("express");
const router = express.Router();
const controller = require("../../../../controllers/web/backend/tax.class.controller");

module.exports = () => {
  router.post("/add-class", controller.validate("add"), controller.create);
  router.get("/tax-class", controller.getClass);
  router.get('/active-class', controller.getActiveClass)
  router.get("/class-details/:tax", controller.getClassDetails);
  router.post("/search-class", controller.validate("search"), controller.search);
  router.put("/update-class", controller.validate("update"), controller.update);
  router.delete("/delete-class/:tax", controller.delete);

  return router;
};
