const express = require("express");
const router = express.Router();
const controller = require("../../../controllers/web/category.controller");

module.exports = () => {
  router.post("/categories", controller.getCategories)
  router.get("/featured-categories", controller.getFeaturedCategories)
  router.post("/subcategories", controller.validate("sub-category"), controller.getSubCategories)
  router.get("/mega-categories", controller.getMegaCategories)
  router.post("/category-landing", controller.getCategoryLandingWeb)
  router.post("/get-all-categories", controller.getAllCategoriesBySlug)
  router.post("/category-by-slug", controller.getCategoryBySlug)
  return router;
};
