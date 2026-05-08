const express = require("express")
const router = express.Router()
const controller = require("../../../../controllers/web/backend/mega.menu.controller")

module.exports = () => {
    router.post("/add-megamenu", controller.create);
    router.put("/update-megamenu", controller.update);
    router.post("/rearrange-megamenu", controller.rearrange);
    router.get("/megamenu-items", controller.find);
    router.get("/megamenu-details/:menuId", controller.findOne);
    router.delete("/delete-megamenu/:menuId", controller.delete);

    return router;
}