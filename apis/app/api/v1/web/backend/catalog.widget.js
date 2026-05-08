const express = require("express")
const router = express.Router()
const controller = require("../../../../controllers/web/backend/catalog.widget.controller")

module.exports = () => {
    router.post("/add-catalog-widget", controller.add);
    router.post("/duplicate-catalog-widget", controller.duplicate);
    router.put("/reorder-catalog-widgets", controller.reorderWidgets);
    router.put("/update-catalog-widget", controller.update);
    router.get("/catalog-widgets/:widget", controller.widgetDetails);
    router.get("/catalog-widgets", controller.widgetDetails);
    router.delete("/delete-catalog-widget/:widget", controller.delete);

    return router;
}