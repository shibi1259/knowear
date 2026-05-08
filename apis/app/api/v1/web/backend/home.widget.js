const express = require("express")
const router = express.Router()
const controller = require("../../../../controllers/web/backend/home.widget.controller")

module.exports = () => {
    router.post("/add-home-widget", controller.add);
    router.post("/duplicate-home-widget", controller.duplicate);
    router.put("/reorder-home-widgets", controller.reorderWidgets);
    router.put("/update-home-widget", controller.update);
    router.get("/home-widgets/:widget", controller.widgetDetails);
    router.get("/home-widgets", controller.widgetDetails);
    router.get("/home-draft-widgets", controller.draftWidgetDetails);
    router.delete("/delete-widget/:widget", controller.delete);
    router.post("/savetodraft-home-widgets", controller.saveHomeWidgetsDraft);
    router.post("/publish-home-widgets", controller.publishHomeWidgets);
    router.get("/get-redirections/:widget", controller.getRedirections);

    return router;
}