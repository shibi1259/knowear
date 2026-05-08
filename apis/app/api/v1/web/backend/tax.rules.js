const express = require("express");
const router = express.Router();
const controller = require("../../../../controllers/web/backend/tax.rules.controller");

module.exports = () => {
  router.post("/add-rule", controller.validate("add"), controller.create);
  router.get("/tax-rules", controller.taxRules);
  router.get("/active-rules", controller.activeTaxRules);
  router.post('/search-rules', controller.validate("search"), controller.search)
  router.get("/rule-details/:tax", controller.getTaxRuleDetails);
  router.put("/update-rule", controller.validate("update"), controller.update);
  router.delete("/delete-rule/:tax", controller.delete);

  return router;
};
