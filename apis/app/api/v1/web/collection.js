const express = require("express");
const router = express.Router();
const controller = require("../../../controllers/web/collection.controller");

module.exports = () => {
  router.post('/collections', controller.getCollections)
  router.post('/collection-by-slug', controller.getCollectionBySlug)

  return router;
};
