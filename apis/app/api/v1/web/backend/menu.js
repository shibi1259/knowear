const express = require("express")
const router = express.Router()
const controller = require("../../../../controllers/web/backend/menu.controller")

module.exports = () => {
    router.post("/add-menu", controller.validate('add'), controller.add);
    router.put("/update-menu", controller.validate('update'), controller.update);
    router.post("/rearrange-menu", controller.rearrange);
    router.get("/menu-items", controller.getMenuItems);
    router.get("/menu-details/:menu", controller.getMenuItemDetails);

    return router;
}