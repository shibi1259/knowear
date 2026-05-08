const express = require("express");
const router = express.Router();
const controller = require("../../../../controllers/web/backend/category.controller");
const upload = require("../../../../../util/upload")
const bulkUpload = require("../../../../../util/categoryUpload")

module.exports = () => {
  router.post("/add-category", controller.create);
  router.get("/category/:categoryId", controller.findOne);
  router.get("/categories", controller.find);
  router.put("/update-category", controller.update);
  router.delete("/delete-category/:categoryId", controller.deleteOne);
  router.post("/search-categories", controller.search);
  router.post("/search-subcategories", controller.searchSubcategories)
  router.post("/find-categories", controller.findCategory)
router.get("/subCategoriesByid",controller.getSubcategoriesByid)

  router.put("/restore-category/:id", controller.restoreCategory);
  router.post("/get-categories", controller.getCategories)
  router.get("/active-categories", controller.getActiveCategory);
  router.get("/main-categories", controller.getMainCategories);
  router.post("/sub-categories", controller.getSubCategories);
  router.post("/subcategory-details", controller.getSubcategoriesByCatid)
  router.post("/archived-categories", controller.archivedCategories)
  router.get("/dropdown-categories", controller.getCategoriesForDropdown)
  router.get("/default-categories", controller.getDefaultCategories)
  router.get("/category-attributes", controller.getDefaultCategories)
  router.post("/child-categories", controller.getChildCategories)
  router.post("/categories/bulk-image-upload", bulkUpload.array('file', 500), controller.bulkMediaUpload)
  router.post("/categories/bulk-file-upload", upload.single('file'), controller.bulkFileUpload)

  router.post("/manage-category-landing", controller.manageCategoryLanding)
  router.post("/category-landing", controller.getCategoryLanding)

  return router;
};
