const express = require("express");
const router = express.Router();
const controller = require("../../../../controllers/web/backend/brand.controller");
const upload = require("../../../../../util/upload")

module.exports = () => {
  router.post("/add-brand", controller.create);
  router.get("/get-brands", controller.getBrands);
  router.post("/search-brands", controller.searchBrands)
  router.get("/active-brands", controller.getActiveBrands);
  router.get("/brand-details", controller.getBrandDetails);
  router.put("/restore-brand/:brand", controller.restoreBrand)
  router.delete("/delete-brand/:brand", controller.deleteBrand);
  router.put("/update-brand", controller.updateBrand);
  router.get("/brands", controller.getBrandsByPage);
  router.post("/brands/bulk-file-upload", upload.single('file'), controller.bulkFileUpload)

  return router;
};
