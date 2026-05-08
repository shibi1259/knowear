const express = require("express");
const router = express.Router();
const controller = require("../../../../controllers/web/backend/catalog.controller");
const upload = require("../../../../../util/upload")

module.exports = () => {
    router.post("/create-catalog", controller.validate("create"), controller.create);
    router.delete("/delete-catalog/:catalog", controller.delete);
    router.put("/update-catalog/:catalog", controller.update);
    router.get("/catalogs", controller.getCatalogs);
    router.get("/catalogs/:catalog", controller.getCatalogDetails);

    return router;
};
