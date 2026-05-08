const express = require("express");
const router = express.Router();
const controller = require("../../../../controllers/web/backend/collection.controller");

module.exports = () => {
    router.post("/add-collection", controller.create);
    router.post("/create-collectionsku", controller.createBySKUs);
    router.get("/collections", controller.find);
    router.get("/collection/:id", controller.findOne);
    router.put("/update-collection", controller.update);
    router.post("/search-collections", controller.search)
    router.get("/collections/active", controller.getActiveCollection);
    router.post("/manage-collection-page", controller.manageCollection);
    router.get("/collection-page", controller.getCollectionPage);


    
    return router;
};
